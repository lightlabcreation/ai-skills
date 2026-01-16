import Controllers from "../Models/Model.js";
import bcrypt from "bcrypt";

import { successResponse, errorResponse } from "../Utils/responseHandler.js";
import { sendVerificationProfile } from "../service/emailService.js";

const InstructorTable = new Controllers("instructor");

class InstructorController {

  static async getAllInstructor(req, res) {
    try {
      const { id } = req.query;
      if (id) {
        const result = await InstructorTable.getById(id);
        if (result) {
          return successResponse(res, 200, "single instructor fetched successfully", result);
        } else {
          return errorResponse(res, 404, "No instructor found for this id.");
        }
      } else {
        const result = await InstructorTable.getAll();
        if (result.length > 0) {
          return successResponse(res, 200, "instructor fetched successfully", result);
        } else {
          return errorResponse(res, 404, "No instructor found.");
        }
      }

    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async createInstructor(req, res) {
    try {
      const { full_name, email, password, mobile_number, expertise} = req.body;

      if (!full_name || !email || !password || !mobile_number || !expertise ) {
        return errorResponse(res, 400, "All required fields must be filled.");
      }

      const existingUser = await InstructorTable.findEmail(email);
      if (existingUser) {
        return errorResponse(res, 409, "Email already in use.");
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const avatar = req.uploadedImageUrl

      const result = await InstructorTable.create({
        full_name,
        email,
        password: hashedPassword,
        mobile_number,
        expertise,
        avatar,
      });

      return successResponse(res, 201, "Instructor created successfully", result);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async editInstructor(req, res) {
    try {
      const { id } = req.params;
      const {
        full_name,
        email,
        mobile_number,
        password,
        expertise,
        bank_account_number,
        ifsc_code,
        is_active
      } = req.body;
  
      if (!id) {
        return errorResponse(res, 400, "Instructor ID is required.");
      }
  
      const existingUser = await InstructorTable.getById(id);
      if (!existingUser) {
        return errorResponse(res, 404, "Instructor not found.");
      }
  
      const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
      const uploadedImageUrl = req.uploadedImageUrl;
  
      const updatedData = {};
  
      if (full_name) updatedData.full_name = full_name;
      if (email) updatedData.email = email;
      if (mobile_number) updatedData.mobile_number = mobile_number;
      if (expertise) updatedData.expertise = expertise;
      if (uploadedImageUrl) updatedData.avatar = uploadedImageUrl;
      if (bank_account_number) updatedData.bank_account_number = bank_account_number;
      if (ifsc_code) updatedData.ifsc_code = ifsc_code;
      if (typeof is_active === "boolean") updatedData.is_active = is_active;
      if (hashedPassword) updatedData.password = hashedPassword;
  
      const result = await InstructorTable.update(id, updatedData);
      if (result.affectedRows === 0) {
        return errorResponse(res, 400, "Update failed.");
      }
  
      return successResponse(res, 200, "Instructor updated successfully", result);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }
  
  static async instructorStatus(req, res) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;

      if (!id) {
        return errorResponse(res, 400, "instructor ID is required.");
      }

      if (!is_active) {
        return errorResponse(res, 400, "is_active must be required.");
      }

      const result = await InstructorTable.update(id, { is_active });

      if (result.affectedRows > 0) {
        return successResponse(res, 200, "instructor status updated successfully.");
      } else {
        return errorResponse(res, 404, "instructor not found.");
      }
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

static async updateInsturctortIsVarified (req, res){
    try {
      const { id } = req.params;
      const { is_verified } = req.body;

      if (!id) {
        return errorResponse(res, 400, "instructor ID is required.");
      }
      const user = await InstructorTable.getById(id);

      if (!is_verified) {
        return errorResponse(res, 400, "is_verified must be required.");
      }

      const result = await InstructorTable.update(id, { is_verified });
      console.log("email : ", user.email);
      if (result.affectedRows > 0) {
        await sendVerificationProfile(user.email)
        return successResponse(res, 200, "change varified status successfully send Email message his email.");
      } else {
        return errorResponse(res, 404, "instructor not found.");
      }
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

   static async updateinstructortPassword(req, res) {
      try {
        const { id } = req.params;
        const { password } = req.body;
  
        if (!id) {
          return errorResponse(res, 400, "instructor ID is required.");
        }
        if (!password) {
          return errorResponse(res, 400, "password must be required.");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("hashedPassword", hashedPassword);
        console.log("password", password);
  
        const result = await InstructorTable.update(id, { password: hashedPassword });
  
        if (result.affectedRows > 0) {
          return successResponse(res, 200, "instructor password updated successfully.");
        } else {
          return errorResponse(res, 404, "instructor not found.");
        }
      } catch (error) {
        return errorResponse(res, 500, error.message);
      }
    }

  static async deleteInstructor(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return errorResponse(res, 400, "Instructor ID is required.");
      }

      const result = await InstructorTable.delete(id);

      if (result.affectedRows > 0) {
        return successResponse(res, 200, "Instructor deleted successfully");
      } else {
        return errorResponse(res, 404, "Instructor not found.");
      }
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async getInstructorDashboard(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return errorResponse(res, 400, "Instructor ID is required.");
      }

      const result = await InstructorTable.getById(id);
      if (result) {
        return successResponse(res, 200, "single instructor fetched successfully", result);
      } else {
        return errorResponse(res, 404, "No instructor found for this id.");
      }
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }
}



export default InstructorController;
