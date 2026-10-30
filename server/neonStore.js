import pg from 'pg';
import { createHash, randomBytes, createHmac, timingSafeEqual } from 'node:crypto';

const { Client } = pg;

function storageConfig(env) {
  const url = env.DATABASE_URL || '';
  const recoverySecret = env.NEATCLOCK_RECOVERY_SECRET || '';
  return { url, recoverySecret, ready: url.startsWith('postgres://') || url.startsWith('postgresql://') && recoverySecret.length >= 32 };
}

function hashRecoveryToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

function generateRecoveryToken() {
  return randomBytes(32).toString('base64url');
}

function signRecoveryToken(email, expiresInMinutes = 15) {
  const payload = { email: email.toLowerCase(), exp: Math.floor(Date.now() / 1000) + expiresInMinutes * 60, iat: Math.floor(Date.now() / 1000) };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', process.env.NEATCLOCK_RECOVERY_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

function verifyRecoveryToken(token, secret) {
  const [encoded, signature, extra] = String(token || '').split('.');
  if (!encoded || !signature || extra) return null;
  const expected = createHmac('sha256', secret).update(encoded).digest('base64url');
  try {
    const a = Buffer.from(signature); const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch { return null; }
}

export function hashOrderProof(value) {
  return createHash('sha256').update(value).digest('hex');
}

export async function createNeonStore(env = process.env, clientImpl = Client) {
  const settings = storageConfig(env);
  if (!settings.ready) throw new Error('durable_store_unavailable');

  const client = new clientImpl({ connectionString: settings.url });
  await client.connect();

  return {
    async createPending(record) {
      const query = `
        INSERT INTO neatclock_purchases (
          order_reference, product_id, product_version, industry, amount_minor, currency,
          artifact_url, business_id, order_proof_hash, payment_status, fulfillment_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', 'pending')
        ON CONFLICT (order_reference) DO NOTHING
        RETURNING *
      `;
      const values = [
        record.order_reference, record.product_id, record.product_version, record.industry,
        record.amount_minor, record.currency, record.artifact_url, record.business_id, record.order_proof_hash
      ];
      const result = await client.query(query, values);
      if (result.rows[0]) return result.rows[0];
      const existing = await this.getByOrderReference(record.order_reference);
      if (!existing || existing.order_proof_hash !== record.order_proof_hash || existing.artifact_url !== record.artifact_url) {
        throw new Error('order_reference_conflict');
      }
      return existing;
    },

    async bindCheckout(orderReference, sessionId) {
      const query = `
        UPDATE neatclock_purchases
        SET checkout_session_id = $1, updated_at = NOW()
        WHERE order_reference = $2 AND checkout_session_id IS NULL
        RETURNING *
      `;
      const result = await client.query(query, [sessionId, orderReference]);
      if (result.rows[0]) return result.rows[0];
      const existing = await this.getByOrderReference(orderReference);
      if (existing?.checkout_session_id !== sessionId) throw new Error('checkout_binding_conflict');
      return existing;
    },

    async getByOrderReference(orderReference) {
      const query = 'SELECT * FROM neatclock_purchases WHERE order_reference = $1 LIMIT 1';
      const result = await client.query(query, [orderReference]);
      return result.rows[0] || null;
    },

    async getReadyBySession(sessionId) {
      const query = 'SELECT * FROM neatclock_purchases WHERE checkout_session_id = $1 AND fulfillment_status = $2 LIMIT 1';
      const result = await client.query(query, [sessionId, 'ready']);
      return result.rows[0] || null;
    },

    async getReadyByEmail(email) {
      const query = 'SELECT * FROM neatclock_purchases WHERE purchaser_email = $1 AND fulfillment_status = $2 ORDER BY paid_at DESC LIMIT 20';
      const result = await client.query(query, [email.toLowerCase(), 'ready']);
      return result.rows;
    },

    async fulfill(eventId, eventCreated, session) {
      await client.query('BEGIN');
      try {
        const webhookQuery = `
          INSERT INTO neatclock_webhook_events (stripe_event_id, event_created_at, checkout_session_id, outcome)
          VALUES ($1, $2, $3, 'processing')
          ON CONFLICT (stripe_event_id) DO NOTHING
          RETURNING outcome
        `;
        const webhookResult = await client.query(webhookQuery, [eventId, new Date(eventCreated * 1000).toISOString(), session.id]);
        if (webhookResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return { outcome: 'duplicate' };
        }

        const purchaseQuery = `
          SELECT * FROM neatclock_purchases
          WHERE order_reference = $1 AND checkout_session_id = $2
          FOR UPDATE
        `;
        const purchaseResult = await client.query(purchaseQuery, [session.client_reference_id, session.id]);
        const purchase = purchaseResult.rows[0];

        if (!purchase) {
          await client.query('DELETE FROM neatclock_webhook_events WHERE stripe_event_id = $1', [eventId]);
          await client.query('ROLLBACK');
          throw new Error('purchase_not_found');
        }

        if (purchase.product_id !== 'neatclock.business-calendar-qr' ||
            purchase.amount_minor !== session.amount_total ||
            purchase.currency !== session.currency) {
          await client.query('UPDATE neatclock_webhook_events SET outcome = $1 WHERE stripe_event_id = $2', ['payment_mismatch', eventId]);
          await client.query('COMMIT');
          return { outcome: 'payment_mismatch' };
        }

        const updateQuery = `
          UPDATE neatclock_purchases
          SET payment_status = 'paid', fulfillment_status = 'ready',
              purchaser_email = $1, payment_intent_id = COALESCE(payment_intent_id, $2),
              stripe_event_id = COALESCE(stripe_event_id, $3),
              stripe_event_created_at = COALESCE(stripe_event_created_at, $4),
              paid_at = COALESCE(paid_at, NOW()), artifact_ready_at = COALESCE(artifact_ready_at, NOW()),
              updated_at = NOW()
          WHERE id = $5
        `;
        await client.query(updateQuery, [
          session.customer_details?.email?.toLowerCase() || session.customer_email?.toLowerCase() || null,
          typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || null,
          eventId,
          new Date(eventCreated * 1000).toISOString(),
          purchase.id
        ]);

        await client.query('UPDATE neatclock_webhook_events SET outcome = $1 WHERE stripe_event_id = $2', ['fulfilled', eventId]);
        await client.query('COMMIT');
        return { outcome: 'fulfilled', purchase_id: purchase.id };
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    },

    async requestRecovery(email, redirectTo) {
      const purchases = await this.getReadyByEmail(email);
      if (purchases.length === 0) return { accepted: true };

      const token = generateRecoveryToken();
      const tokenHash = hashRecoveryToken(token);
      const signedToken = signRecoveryToken(email);

      const insertQuery = `
        INSERT INTO neatclock_recovery_tokens (token_hash, purchaser_email, expires_at, created_at)
        VALUES ($1, $2, NOW() + INTERVAL '15 minutes', NOW())
        ON CONFLICT (purchaser_email) DO UPDATE SET
          token_hash = EXCLUDED.token_hash,
          expires_at = EXCLUDED.expires_at,
          created_at = EXCLUDED.created_at
      `;
      await client.query(insertQuery, [tokenHash, email.toLowerCase()]);

      return { accepted: true, recoveryToken: signedToken, redirectTo: `${redirectTo}?token=${signedToken}` };
    },

    async verifiedIdentity(token) {
      const payload = verifyRecoveryToken(token, settings.recoverySecret);
      if (!payload) return null;
      return { email: payload.email.toLowerCase() };
    },

    async consumeRecovery(identity) {
      const tokenHash = hashRecoveryToken(identity.rawToken);
      const query = `
        DELETE FROM neatclock_recovery_tokens
        WHERE token_hash = $1 AND purchaser_email = $2 AND expires_at > NOW()
        RETURNING purchaser_email
      `;
      const result = await client.query(query, [tokenHash, identity.email.toLowerCase()]);
      return result.rows.length > 0;
    },

    async close() {
      await client.end();
    },
  };
}
