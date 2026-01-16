import Controllers from "../Models/Model.js";
import bcrypt from "bcrypt";

import { notify } from "../notification.js"

import { successResponse, errorResponse } from "../Utils/responseHandler.js";

const CategoryTable = new Controllers("category");

class CategoryController {

  static async getAllCategory(req, res) {
    try {
      const { id } = req.query;
      if (id) {
        const result = await CategoryTable.getById(id);
        if (result) {
          return successResponse(res, 200, "single Category fetched successfully", result);
        } else {
          return errorResponse(res, 404, "No Category found for this id.");
        }
      } else {
        const result = await CategoryTable.getAll();
        if (result.length > 0) {
          return successResponse(res, 200, "Category fetched successfully", result);
        } else {
          return errorResponse(res, 404, "No Category found.");
        }
      }

    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async createCategory(req, res) {
    try {
      const { category_name, fcmToken } = req.body;

      if (!category_name ) {
        return errorResponse(res, 400, "All fields are required.");
      }

      const existing = await CategoryTable.findCategory(category_name);
      if (existing) {
        return errorResponse(res, 409, "Category already exists.");
      }

      const result = await CategoryTable.create({ category_name, fcmToken });

       const message = {
              notification: {
                title: `New Category ${category_name}`,
                body: `${category_name} is now available!`,
              },
              token: fcmToken,
            };
            
            try {
              const response = await notify.messaging().send(message);
              console.log("Notification Sent:", response);
              return successResponse(res, 201, "category created successfully", result);
            } catch (error) {
              console.error("Notification Error:", error);
              return errorResponse(res, 201, "category created but notification failed");
            }
    } catch (error) {
      console.log("error :",error);
      return errorResponse(res, 500, error.message);
    }
  }

  static async editCategory(req, res) {
    try {
      const { id } = req.params;
      const { category_name } = req.body;

      if (!id) {
        return errorResponse(res, 400, "Category ID is required.");
      }

      const existingCategory = await CategoryTable.getById(id);
      if (!existingCategory) {
        return errorResponse(res, 404, "Category not found.");
      }

      if (!category_name) {
        return errorResponse(res, 400, "Category name is required.");
      }

      const result = await CategoryTable.update(id, { category_name });

      if (result.affectedRows === 0) {
        return errorResponse(res, 400, "Update failed.");
      }

      return successResponse(res, 200, "Category updated successfully", result);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return errorResponse(res, 400, "Category ID is required.");
      }

      const result = await CategoryTable.delete(id);

      if (result.affectedRows > 0) {
        return successResponse(res, 200, "Category deleted successfully");
      } else {
        return errorResponse(res, 404, "Category not found.");
      }
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }
}

export default CategoryController;
