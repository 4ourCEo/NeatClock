import { businessRecovery } from '../server/businessCommerce.js';

export default function handler(req, res) {
  return businessRecovery(req, res);
}
