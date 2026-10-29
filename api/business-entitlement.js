import { businessEntitlement } from '../server/businessCommerce.js';

export default function handler(req, res) {
  return businessEntitlement(req, res);
}
