import Controllers from "../Models/Model.js";

import { successResponse, errorResponse } from "../Utils/responseHandler.js";

import { notify } from "../notification.js"

const SubscriptionTable = new Controllers("subscriptions");

class subscriptionCtrl{
    static async createSubscription(req, res) {
        try {
            const { admin_id, plan_id, billing_type } = req.body;
            const duration = billing_type === 'monthly' ? 30 : 365;
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + duration);
            const data = {
                admin_id,
                plan_id,
                billing_type,
                start_date: new Date(),
                end_date: endDate,
            }

            const result = await SubscriptionTable.create(data);
            if (result) {
                return successResponse(res, 201, "Subscription created successfully", result);
            }
            return errorResponse(res, 400, "Subscription not created");
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    static async getSubscription(req, res) {
        try {
            const { admin_id } = req.params;
            const result = await SubscriptionTable.getSubcriptionByAdminId({ admin_id });
            if (result) {
                return successResponse(res, 200, "Subscription retrieved successfully", result);
            }
            return errorResponse(res, 400, "Subscription not retrieved");
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    static async getAllSubscriptions(_, res) {
        try {
          const result = await SubscriptionTable.getAll(); // assumes you have a generic getAll()
          return successResponse(res, 200, "All subscriptions fetched", result);
        } catch (error) {
          return errorResponse(res, 500, error.message);
        }
      }
}
export default subscriptionCtrl;