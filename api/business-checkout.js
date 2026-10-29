import { businessCheckout } from '../server/businessCommerce.js';

export default function handler(req, res) {
  return businessCheckout(req, res);
}
