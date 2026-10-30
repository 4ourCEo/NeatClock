import { createHash } from 'node:crypto';

function storageConfig(env) {
  const url = (env.NEATCLOCK_SUPABASE_URL || '').replace(/\/$/, '');
  const serviceKey = env.NEATCLOCK_SUPABASE_SERVICE_ROLE_KEY || '';
  const publishableKey = env.NEATCLOCK_SUPABASE_PUBLISHABLE_KEY || '';
  return { url, serviceKey, publishableKey, ready: url.startsWith('https://') && Boolean(serviceKey) && Boolean(publishableKey) };
}

function headers(key, extra = {}) {
  return { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...extra };
}

async function json(response) {
  if (!response.ok) throw new Error(`durable_store_${response.status}`);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export function hashOrderProof(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function createBusinessStore(env = process.env, fetchImpl = fetch) {
  const settings = storageConfig(env);
  if (!settings.ready) throw new Error('durable_store_unavailable');
  const rest = `${settings.url}/rest/v1`;

  return {
    async createPending(record) {
      const response = await fetchImpl(`${rest}/neatclock_purchases?on_conflict=order_reference`, {
        method: 'POST',
        headers: headers(settings.serviceKey, { Prefer: 'resolution=ignore-duplicates,return=representation' }),
        body: JSON.stringify(record),
      });
      const rows = await json(response);
      if (rows?.[0]) return rows[0];
      const existing = await this.getByOrderReference(record.order_reference);
      if (!existing || existing.order_proof_hash !== record.order_proof_hash || existing.artifact_url !== record.artifact_url) {
        throw new Error('order_reference_conflict');
      }
      return existing;
    },
    async bindCheckout(orderReference, sessionId) {
      const response = await fetchImpl(`${rest}/neatclock_purchases?order_reference=eq.${encodeURIComponent(orderReference)}&checkout_session_id=is.null`, {
        method: 'PATCH',
        headers: headers(settings.serviceKey, { Prefer: 'return=representation' }),
        body: JSON.stringify({ checkout_session_id: sessionId, updated_at: new Date().toISOString() }),
      });
      const rows = await json(response);
      if (rows?.[0]) return rows[0];
      const existing = await this.getByOrderReference(orderReference);
      if (existing?.checkout_session_id !== sessionId) throw new Error('checkout_binding_conflict');
      return existing;
    },
    async getByOrderReference(orderReference) {
      const response = await fetchImpl(`${rest}/neatclock_purchases?order_reference=eq.${encodeURIComponent(orderReference)}&limit=1`, { headers: headers(settings.serviceKey) });
      return (await json(response))?.[0] || null;
    },
    async getReadyBySession(sessionId) {
      const response = await fetchImpl(`${rest}/neatclock_purchases?checkout_session_id=eq.${encodeURIComponent(sessionId)}&fulfillment_status=eq.ready&limit=1`, { headers: headers(settings.serviceKey) });
      return (await json(response))?.[0] || null;
    },
    async getReadyByEmail(email) {
      const response = await fetchImpl(`${rest}/neatclock_purchases?purchaser_email=eq.${encodeURIComponent(email.toLowerCase())}&fulfillment_status=eq.ready&order=paid_at.desc&limit=20`, { headers: headers(settings.serviceKey) });
      return await json(response) || [];
    },
    async fulfill(eventId, eventCreated, session) {
      const response = await fetchImpl(`${rest}/rpc/fulfill_neatclock_purchase`, {
        method: 'POST',
        headers: headers(settings.serviceKey),
        body: JSON.stringify({
          p_event_id: eventId,
          p_event_created: new Date(eventCreated * 1000).toISOString(),
          p_session_id: session.id,
          p_order_reference: session.client_reference_id,
          p_email: session.customer_details?.email?.toLowerCase() || session.customer_email?.toLowerCase() || null,
          p_amount_minor: session.amount_total,
          p_currency: session.currency,
          p_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || null,
        }),
      });
      return await json(response);
    },
    async requestRecovery(email, redirectTo) {
      const response = await fetchImpl(`${settings.url}/auth/v1/otp?redirect_to=${encodeURIComponent(redirectTo)}`, {
        method: 'POST',
        headers: { apikey: settings.publishableKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), create_user: true, gotrue_meta_security: {} }),
      });
      if (!response.ok && response.status !== 429) throw new Error('recovery_delivery_unavailable');
      return { accepted: true };
    },
    async verifiedIdentity(accessToken) {
      const response = await fetchImpl(`${settings.url}/auth/v1/user`, {
        headers: { apikey: settings.publishableKey, Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) return null;
      const user = await response.json();
      if (!user.email_confirmed_at || typeof user.email !== 'string') return null;
      try {
        const payload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64url').toString('utf8'));
        return typeof payload.session_id === 'string' ? { email: user.email.toLowerCase(), sessionId: payload.session_id, userId: user.id } : null;
      } catch { return null; }
    },
    async consumeRecovery(identity) {
      const response = await fetchImpl(`${rest}/neatclock_recovery_claims`, {
        method: 'POST', headers: headers(settings.serviceKey, { Prefer: 'return=minimal' }),
        body: JSON.stringify({ auth_session_id: identity.sessionId, auth_user_id: identity.userId, purchaser_email: identity.email }),
      });
      if (response.status === 409) return false;
      await json(response); return true;
    },
  };
}
