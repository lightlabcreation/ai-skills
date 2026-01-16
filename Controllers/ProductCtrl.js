import Controllers from "../Models/Model.js";
import { successResponse, errorResponse } from "../Utils/responseHandler.js";

const ProductTable = new Controllers("products");

const InstructorTable = new Controllers("instructor");

class ProductController {

    static async getAllproduct(req, res) {
        try {
            const { id, instructor_id } = req.query;

            if (id) {
                const result = await ProductTable.getById(id);
                if (!result) return errorResponse(res, 404, "No product found for this ID.");
                console.log(result);
                const category_name = await ProductTable.findCategoryById(result?.category_id);
                const instructor_details = await InstructorTable.findInstructorById(result?.instructor_id);
                return successResponse(res, 200, "Single product fetched successfully", {
                    ...result,
                    category_name,
                    instructor_details
                });
            }

            let results;
            if (instructor_id) {
                results = await ProductTable.getByInstructorId(instructor_id);
            } else {
                results = await ProductTable.getAll();
            }

            if (!results || (Array.isArray(results) && results.length === 0)) {
                return errorResponse(res, 404, "No products found.");
            }

            const resultArray = Array.isArray(results) ? results : [results];

            const updatedResults = await Promise.all(
                resultArray.map(async (row) => {
                    const category_name = await ProductTable.findCategoryById(row.category_id);
                    const instructor_details = await ProductTable.findInstructorById(row.instructor_id);

                    return {
                        ...row,
                        category_name,
                        instructor_details: [instructor_details],
                        // instructor_name:instructor_data.full_name,
                        // instructor_role:instructor_data.role,
                        // instructor_email:instructor_data.email,
                        // instructor_mobile_number:instructor_data.mobile_number,
                        // instructor_expertise:instructor_data.expertise,
                        // instructor_profile_image:instructor_data.profile_image,
                        // instructor_is_active:instructor_data.is_active,
                        // instructor_bank_account_number:instructor_data.bank_account_number,
                        // instructor_ifsc_code:instructor_data.ifsc_code,
                        // instructor_created_at:instructor_data.created_at,
                        // instructor_updated_at:instructor_data.updated_at,
                    };
                })
            );


            return successResponse(res, 200, "Products fetched successfully", updatedResults);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }


    static async createproduct(req, res) {
        try {
            const {
                product_title,
                category_id,
                description,
                regular_price,
                sale_price,
                status,
                author,
                product_type,
                publish_date,
                instructor_id
            } = req.body;

            if (!product_title || !category_id || !regular_price || !sale_price || !author || !product_type || !publish_date || !instructor_id) {
                return errorResponse(res, 400, "Required fields are missing.");
            }

            const existing = await ProductTable.findProduct(product_title);
            if (existing) {
                return errorResponse(res, 409, "Product with this title already exists.");
            }

            const product_images = req.uploadedImages;

            const result = await ProductTable.create({
                product_title,
                category_id,
                description,
                regular_price,
                sale_price,
                status,
                author,
                product_type,
                publish_date,
                instructor_id,
                product_images: JSON.stringify(product_images)
            });

            return successResponse(res, 201, "Product created successfully", result);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    static async editproduct(req, res) {
        try {
            const { id } = req.params;
            const {
                product_title,
                category_id,
                description,
                regular_price,
                sale_price,
                status,
                author,
                product_type,
                publish_date,
            } = req.body;
            console.log("req.body", req.body);

            if (!id) {
                return errorResponse(res, 400, "Product ID is required.");
            }

            const existing = await ProductTable.getById(id);
            if (!existing) {
                return errorResponse(res, 404, "Product not found.");
            }

            const updateData = {
                product_title,
                category_id,
                description,
                regular_price,
                sale_price,
                status,
                author,
                product_type,
                publish_date,
            };

            // Optional image update
            if (req.uploadedImages && req.uploadedImages.length > 0) {
                updateData.product_images = JSON.stringify(req.uploadedImages);
            }

            const result = await ProductTable.update(id, updateData);
            console.log("result", result);
            if (result.affectedRows === 0) {
                return errorResponse(res, 400, "Update failed.");
            }

            return successResponse(res, 200, "Product updated successfully", result);
        } catch (error) {
            console.error("Update product error:", error);
            return errorResponse(res, 500, error.message);
        }
    }


    static async publishProduct(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!id) {
                return errorResponse(res, 400, "product ID is required.");
            }

            if (!status) {
                return errorResponse(res, 400, "status must be required.");
            }

            const result = await ProductTable.update(id, { status });

            if (result.affectedRows > 0) {
                return successResponse(res, 200, "product published successfully.");
            } else {
                return errorResponse(res, 404, "product not found.");
            }
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    static async deleteproduct(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return errorResponse(res, 400, "Product ID is required.");
            }

            const result = await ProductTable.delete(id);

            if (result.affectedRows > 0) {
                return successResponse(res, 200, "Product deleted successfully");
            } else {
                return errorResponse(res, 404, "Product not found.");
            }
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }
}

export default ProductController;
