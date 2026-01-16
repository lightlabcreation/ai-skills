import Controllers from "../Models/Model.js";
import { successResponse, errorResponse } from "../Utils/responseHandler.js";

const SubBlogTable = new Controllers("sub_blog");

class SubBlogController {
  static async getAllSubBlogs(req, res) {
    try {
      const { id } = req.query;
      
      if (id) {
        const result = await SubBlogTable.getById(id);
        if (result) {
          const enrichedResult = await Promise.all(
            [result].map(async (row) => {
              const blog_id = row["blog_id"];
              const blog_name = await SubBlogTable.findBlogById(blog_id);
              return {
                ...row,
                blog_name,
              };
            })
          );
          return successResponse(res, 200, "Single sub-blog fetched successfully", enrichedResult[0]);
        } else {
          return errorResponse(res, 404, "No sub-blog found for this ID.");
        }
      }

      const result = await SubBlogTable.getAll();
      if (result.length > 0) {
        const enrichedResult = await Promise.all(
          result.map(async (row) => {
            const blog_id = row["blog_id"];
            const blog_name = await SubBlogTable.findBlogById(blog_id);
            return {
              ...row,
              blog_name,
            };
          })
        );
        return successResponse(res, 200, "Sub-blogs fetched successfully", enrichedResult);
      } else {
        return errorResponse(res, 404, "No sub-blogs found.");
      }
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async createSubBlog(req, res) {
    try {
      const { title, blog_id, description } = req.body;

      if (!title || !blog_id) {
        return errorResponse(res, 400, "Title and blog_id are required.");
      }

      const uploadedImage = req.uploadedImageUrl;
      if (!uploadedImage) {
        return errorResponse(res, 400, "sub_blog image is required.");
      }

      const result = await SubBlogTable.create({
        title,
        blog_id,
        description,
        sub_blog_image: uploadedImage,
      });

      return successResponse(res, 201, "Sub-blog created successfully", result);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async editSubBlog(req, res) {
    try {
      const { id } = req.params;
      const { title, blog_id, description } = req.body;

      if (!id) return errorResponse(res, 400, "Sub-blog ID is required.");

      const existing = await SubBlogTable.getById(id);
      if (!existing) return errorResponse(res, 404, "Sub-blog not found.");

      const updateData = {
        title,
        blog_id,
        description,
      };

      if (req.uploadedImageUrl) {
        updateData.sub_blog = req.uploadedImageUrl;
      }

      const result = await SubBlogTable.update(id, updateData);

      if (result.affectedRows === 0) {
        return errorResponse(res, 400, "Update failed.");
      }

      return successResponse(res, 200, "Sub-blog updated successfully", result);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async deleteSubBlog(req, res) {
    try {
      const { id } = req.params;

      if (!id) return errorResponse(res, 400, "Sub-blog ID is required.");

      const result = await SubBlogTable.delete(id);
      if (result.affectedRows > 0) {
        return successResponse(res, 200, "Sub-blog deleted successfully");
      } else {
        return errorResponse(res, 404, "Sub-blog not found.");
      }
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }
}

export default SubBlogController;
