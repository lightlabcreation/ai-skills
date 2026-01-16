import Controllers from "../Models/Model.js";
import { successResponse, errorResponse } from "../Utils/responseHandler.js";

const CertificateTable = new Controllers("certificate_template");

class CertificateController {

  static async getAllCertificate(req, res) {
    try {
      const { id } = req.query;
      if (id) {
        const result = await CertificateTable.getById(id);

        if (result) {
          const updatedResult = await Promise.all(
            [result].map(async (row) => {
              const cid = row["category_id"];

              const category_name = await CertificateTable.findCategoryById(cid);

              return {
                ...row,
                category_name,
              };
            })
          );
          return successResponse(res, 200, "Single certificate fetched successfully", updatedResult);
        } else {
          return errorResponse(res, 404, "No certificate found for this ID.");
        }
      }

      const result = await CertificateTable.getAll();
      if (result.length > 0) {
        const updatedResult = await Promise.all(
          result.map(async (row) => {
            const cid = row["category_id"];

            const category_name = await CertificateTable.findCategoryById(cid);

            return {
              ...row,
              category_name,
            };
          })
        );
        return successResponse(res, 200, "Certificates fetched successfully", updatedResult);
      } else {
        return errorResponse(res, 404, "No certificates found.");
      }
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async createCertificate(req, res) {
    try {
      const {
        template_name,
        category_id,
        template_size,
        border_style,
        certificate_content,
        status,
        student_id
      } = req.body;

      if (!template_name) {
        return errorResponse(res, 400, "Template name is required.");
      }

      const img = req.uploadedImageUrl
      const existing = await CertificateTable.findCertificate(template_name);
      if (existing) {
        return errorResponse(res, 409, "Certificate template already exists.");
      }

      const result = await CertificateTable.create({
        template_name,
        category_id,
        template_size,
        border_style,
        certificate: img,
        certificate_content,
        student_id,
        status

      });

      return successResponse(res, 201, "Certificate template created successfully", result);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async editCertificate(req, res) {
    try {
      const { id } = req.params;
      const {
        template_name,
        category_id,
        template_size,
        border_style,
        student_id,
        certificate_content
      } = req.body;

      if (!id) {
        return errorResponse(res, 400, "Certificate ID is required.");
      }

      const existing = await CertificateTable.getById(id);
      if (!existing) {
        return errorResponse(res, 404, "Certificate not found.");
      }

      const updateData = {
        template_name,
        category_id,
        template_size,
        border_style,
        student_id,
        certificate_content
      };

      if (req.uploadedImageUrl) {
        updateData.certificate = req.uploadedImageUrl;
      }

      const result = await CertificateTable.update(id, updateData);

      if (result.affectedRows === 0) {
        return errorResponse(res, 400, "Update failed.");
      }

      return successResponse(res, 200, "Certificate updated successfully", result);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async publishCertificate(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!id) {
        return errorResponse(res, 400, "Certificate ID is required.");
      }

      if (!status) {
        return errorResponse(res, 400, "status must be required.");
      }

      const result = await CertificateTable.update(id, { status });

      if (result.affectedRows > 0) {
        return successResponse(res, 200, "Certificate published successfully.");
      } else {
        return errorResponse(res, 404, "Certificate not found.");
      }
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async deleteCertificate(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return errorResponse(res, 400, "Certificate ID is required.");
      }

      const result = await CertificateTable.delete(id);

      if (result.affectedRows > 0) {
        return successResponse(res, 200, "Certificate deleted successfully");
      } else {
        return errorResponse(res, 404, "Certificate not found.");
      }
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }
}

export default CertificateController;
