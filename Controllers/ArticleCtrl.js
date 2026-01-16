import Controllers from "../Models/Model.js";
import { successResponse, errorResponse } from "../Utils/responseHandler.js";

const ArticleTable = new Controllers("article");

class ArticleController {

     static async getAllarticle(req, res) {
        try {
            const { id } = req.query;
            if (id) {
                const result = await ArticleTable.getById(id);

                if (result) {
                    const updatedResult = await Promise.all(
                        [result].map(async (row) => {
                            const cid = row["category_id"];

                            const category_name = await ArticleTable.findCategoryById(cid);

                            return {
                                ...row,
                                category_name,
                            };
                        })
                    );
                    return successResponse(res, 200, "Single article fetched successfully", updatedResult);
                } else {
                    return errorResponse(res, 404, "No article found for this ID.");
                }
            }

            const result = await ArticleTable.getAll();
            if (result.length > 0) {
                const updatedResult = await Promise.all(
                    result.map(async (row) => {
                        const cid = row["category_id"];

                        const category_name = await ArticleTable.findCategoryById(cid);

                        return {
                            ...row,
                            category_name,
                        };
                    })
                );
                return successResponse(res, 200, "articles fetched successfully", updatedResult);
            } else {
                return errorResponse(res, 404, "No articles found.");
            }
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    static async createarticle(req, res) {
        try {
            const {
                title,
                content,
                tags,
                category_id,
                status
            } = req.body;

            if (!title) {
                return errorResponse(res, 400, "title is required.");
            }

            const img = req.uploadedImageUrl
            console.log("img : ", req.file);
            
            const existing = await ArticleTable.findarticle(title);
            if (existing) {
                return errorResponse(res, 409, "title already exists.");
            }

            const result = await ArticleTable.create({
                title,
                content,
                tags,
                category_id,
                status,
                article: img

            });

            return successResponse(res, 201, "article created successfully", result);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    static async editarticle(req, res) {
        try {
            const { id } = req.params;
            const {
                title,
                content,
                tags,
                category_id,
                status
            } = req.body;

            if (!id) {
                return errorResponse(res, 400, "article ID is required.");
            }

            const existing = await ArticleTable.getById(id);
            if (!existing) {
                return errorResponse(res, 404, "article not found.");
            }

            const updateData = {
                title,
                content,
                tags,
                category_id,
                status
            };

            if (req.uploadedImageUrl) {
                updateData.article = req.uploadedImageUrl;
            }

            const result = await ArticleTable.update(id, updateData);

            if (result.affectedRows === 0) {
                return errorResponse(res, 400, "Update failed.");
            }

            return successResponse(res, 200, "article updated successfully", result);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    static async publisharticle(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            console.log("status : ", status);

            if (!id) {
                return errorResponse(res, 400, "article ID is required.");
            }

            if (!status) {
                return errorResponse(res, 400, "status must be required.");
            }

            const result = await ArticleTable.update(id, { status });

            if (result.affectedRows > 0) {
                return successResponse(res, 200, "article published successfully.");
            } else {
                return errorResponse(res, 404, "article not found.");
            }
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    static async deletearticle(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return errorResponse(res, 400, "article ID is required.");
            }

            const result = await ArticleTable.delete(id);

            if (result.affectedRows > 0) {
                return successResponse(res, 200, "article deleted successfully");
            } else {
                return errorResponse(res, 404, "article not found.");
            }
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }
}

export default ArticleController;
