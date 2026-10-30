import { businessWebhook, readRawBody } from '../server/businessCommerce.js';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const rawBody = await readRawBody(req);
  return businessWebhook(req, res, { rawBody });
}
