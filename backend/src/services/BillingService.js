const prisma = require('../config/db');

class BillingService {
  /**
   * Mock method for Stripe checkout session creation
   */
  async createCheckoutSession(storeId, priceId) {
    throw new Error('Stripe integration not implemented yet');
  }

  /**
   * Mock method to handle Stripe webhooks
   */
  async handleWebhook(req) {
    throw new Error('Stripe integration not implemented yet');
  }

  /**
   * Mock method for cancelling a subscription via Stripe API
   */
  async cancelSubscription(externalSubscriptionId) {
    throw new Error('Stripe integration not implemented yet');
  }

  /**
   * Mock method for changing the Stripe plan associated with a subscription
   */
  async changePlan(externalSubscriptionId, newPriceId) {
    throw new Error('Stripe integration not implemented yet');
  }
}

module.exports = new BillingService();
