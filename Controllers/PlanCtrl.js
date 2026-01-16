import Controllers from "../Models/Model.js";

import { successResponse, errorResponse } from "../Utils/responseHandler.js";

import { notify } from "../notification.js"

const PlansTable = new Controllers("plans");

const PlansEnquiryTable = new Controllers("plan_enquiry");

class plansCtrl {
    static async createPlan(req, res) {
        const { name, price_monthly, price_yearly, features, description } = req.body;
        console.log("request.body ", req.body);
        try {
            if (!name) {
                return errorResponse(res, 400, "Name required fields must be filled.");
            }

            const result = await PlansTable.create({
                name,
                price_monthly,
                price_yearly,
                features: JSON.stringify(features),
                description
            });


            return successResponse(res, 201, "Plan created successfully", result);

        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    static async getPlans(_, res) {
        try {
            const result = await PlansTable.getAll();
            return successResponse(res, 200, "Plans retrieved successfully", result);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    static async deletePlan(req, res) {
        try {
            const { id } = req.params;
            const result = await PlansTable.delete(id);
            return successResponse(res, 200, "Plan deleted successfully", result);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }

    }

    static async updatePlan(req, res) {
        try {
            const { id } = req.params;
            const { name, price_monthly, price_yearly, features, description } = req.body;
            const result = await PlansTable.update(id, {
                name,
                price_monthly,
                price_yearly,
                features: JSON.stringify(features),
                description
            });
            return successResponse(res, 200, "Plan updated successfully", result);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    static async createPlanenquiry(req, res) {
        const { name, phone, message, plan_name, duration } = req.body;
        try {
            if (!name) {
                return errorResponse(res, 400, "Name required fields must be filled.");
            }

            const result = await PlansEnquiryTable.create({
                name, phone, message, plan_name, duration
            });


            return successResponse(res, 201, "Plans Enquiry created successfully", result);

        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    static async getPlanenquiry(_, res) {
        try {
            const result = await PlansEnquiryTable.getAll();
            return successResponse(res, 200, "Plans Enquiry retrieved successfully", result);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

}


export default plansCtrl;