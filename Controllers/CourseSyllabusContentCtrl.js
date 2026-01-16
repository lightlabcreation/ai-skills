import Controllers from "../Models/Model.js";
import { successResponse, errorResponse } from "../Utils/responseHandler.js";

const CourseSyllabusContentTable = new Controllers("course_syllabus_content");

class CourseSyllabusContentController {

    static async getAllContent(req, res) {
        try {
            const { id, subTitle_id } = req.query;

            if (id) {
                const result = await CourseSyllabusContentTable.getById(id);
                if (result) {
                    return successResponse(res, 200, "Single content fetched successfully", result);
                } else {
                    return errorResponse(res, 404, "No content found for this ID.");
                }
            }

            if (subTitle_id) {
                const result = await CourseSyllabusContentTable.getBySubTitleId(subTitle_id);
                if (result.length > 0) {
                    return successResponse(res, 200, "Contents fetched successfully by subtitle", result);
                } else {
                    return errorResponse(res, 404, "No contents found for this subtitle ID.");
                }
            }

            const result = await CourseSyllabusContentTable.getAll();
            if (result.length > 0) {
                return successResponse(res, 200, "All contents fetched successfully", result);
            } else {
                return errorResponse(res, 404, "No contents found.");
            }

        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }


    static async createContent(req, res) {
        try {
            const { description, name, subTitle_id } = req.body;
            if (!name || !subTitle_id) {
                return errorResponse(res, 400, "name and subTitle_id are required.");
            }

            const image = req.uploadedImageUrl;

            const result = await CourseSyllabusContentTable.create({
                name,
                description,
                subTitle_id,
                image
            });

            return successResponse(res, 201, "Content created successfully", result);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    static async editContent(req, res) {
        try {
            const { id } = req.params;
            const { description, name, subTitle_id } = req.body;

            if (!id) {
                return errorResponse(res, 400, "Content ID is required.");
            }

            const existing = await CourseSyllabusContentTable.getById(id);
            if (!existing) {
                return errorResponse(res, 404, "Content not found.");
            }

            const updateData = {
                name,
                description,
                subTitle_id
            };

            if (req.uploadedImageUrl) {
                updateData.image = req.uploadedImageUrl;
            }

            const result = await CourseSyllabusContentTable.update(id, updateData);

            if (result.affectedRows === 0) {
                return errorResponse(res, 400, "Update failed.");
            }

            return successResponse(res, 200, "Content updated successfully", result);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    static async deleteContent(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return errorResponse(res, 400, "Content ID is required.");
            }

            const result = await CourseSyllabusContentTable.delete(id);

            if (result.affectedRows > 0) {
                return successResponse(res, 200, "Content deleted successfully");
            } else {
                return errorResponse(res, 404, "Content not found.");
            }
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }
}

export default CourseSyllabusContentController;
