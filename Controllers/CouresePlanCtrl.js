import Controllers from "../Models/Model.js";
import { successResponse, errorResponse } from "../Utils/responseHandler.js";
// import { notify } from "../notification.js";

// Tables
const CoursePlansTable = new Controllers("course_plan");
const BusinessEnquiryTable = new Controllers("business_enquiry");

class coursePlansCtrl {
    // 👉 Create Course Plan
    static async createCoursePlan(req, res) {
        const { description, price, planname ,duration} = req.body;
        console.log("request.body ", req.body);

        try {
            if (!planname || !price) {
                return errorResponse(res, 400, "Course plan name and price are required.");
            }

            const result = await CoursePlansTable.create({
                planname,
                description,
                price,
                duration
            });

            // Optional notification
            // notify("New course plan created", { planname, price });

            return successResponse(res, 201, "Course plan created successfully", result);

        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    // 👉 Get all Course Plans
    static async getCoursePlans(_, res) {
        try {
            const result = await CoursePlansTable.getAll();
            return successResponse(res, 200, "Course plans retrieved successfully", result);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    // 👉 Delete Course Plan
    static async deleteCoursePlan(req, res) {
        try {
            const { id } = req.params;
            if (!id) return errorResponse(res, 400, "Course plan ID is required.");

            const result = await CoursePlansTable.delete(id);
            return successResponse(res, 200, "Course plan deleted successfully", result);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    // 👉 Update Course Plan
    static async updateCoursePlan(req, res) {
        try {
            const { id } = req.params;
            const { description, price, planname ,duration} = req.body;

            if (!id) return errorResponse(res, 400, "Course plan ID is required.");

            const result = await CoursePlansTable.update(id, {
                description,
                price,
                duration,
                planname
            });

            return successResponse(res, 200, "Course plan updated successfully", result);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }



    static async createBusinessEnquiry(req, res) {
        const { name, email, phone, company_name, description } = req.body;

        try {
            if (!name || !email) {
                return errorResponse(res, 400, "Name and email are required.");
            }

            const result = await BusinessEnquiryTable.create({
                name,
                email,
                phone,
                company_name,
                description
            });

            // Optional notification
            // notify("New business enquiry received", { name, email });

            return successResponse(res, 201, "Business enquiry created successfully", result);

        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    // 👉 Get All Business Enquiries
    static async getBusinessEnquiries(_, res) {
        try {
            const result = await BusinessEnquiryTable.getAll();
            return successResponse(res, 200, "Business enquiries retrieved successfully", result);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    // 👉 Delete Business Enquiry
    static async deleteBusinessEnquiry(req, res) {
        try {
            const { id } = req.params;
            if (!id) return errorResponse(res, 400, "Enquiry ID is required.");

            const result = await BusinessEnquiryTable.delete(id);
            return successResponse(res, 200, "Business enquiry deleted successfully", result);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

}

export default coursePlansCtrl;
