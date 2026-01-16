import Controllers from "../Models/Model.js";
import { successResponse, errorResponse } from "../Utils/responseHandler.js";

const ReviewTable = new Controllers("reviews");

class ReviewController {
    // Create Review
    static async createReview(req, res) {
        try {
            const { rating, review_text, course_id, student_id } = req.body;

            if (!rating || !review_text || !course_id || !student_id) {
                return errorResponse(res, 400, "All fields (rating, review_text, course_id, student_id) are required.");
            }

            const result = await ReviewTable.create({
                rating,
                review_text,
                course_id,
                student_id,
            });

            return successResponse(res, 201, "Review submitted successfully.", result);
        } catch (error) {
            console.error("Review Error:", error);
            return errorResponse(res, 500, error.message);
        }
    }

static async getAllReviews(req, res) {
    try {
        const result = await ReviewTable.getAll(); // result is an array

        if (result) {
            const updatedResult = await Promise.all(
                result.map(async (row) => {
                    const sid = row["student_id"];
                    const studentData = await ReviewTable.getStudentNameById(sid);

                    return {
                        ...row,
                        student_name: studentData?.name || null
                    };
                })
            );

            return successResponse(res, 200, "All reviews fetched successfully", updatedResult);
        }
    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
}

  static async deleteReview(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return errorResponse(res, 400, "ID is required.");
            }

            const result = await ReviewTable.delete(id);

            if (result.affectedRows > 0) {
                return successResponse(res, 200, "Review deleted successfully.");
            } else {
                return errorResponse(res, 404, "Review not found.");
            }
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }
}

export default ReviewController;
