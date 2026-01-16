import Controllers from "../Models/Model.js";
import { successResponse, errorResponse } from "../Utils/responseHandler.js";

const LaunchNowTable = new Controllers("launch_now");

class LaunchNowController {
  static async createLaunchNow(req, res) {
    try {
      const { name, email, program_name } = req.body;

      if (!name || !email || !program_name) {
        return errorResponse(res, 400, "All fields (name, email, program_name) are required.");
      }

      const result = await LaunchNowTable.create({ name, email, program_name });

      return successResponse(res, 201, "Launch request submitted successfully.", result);
    } catch (error) {
      console.error("LaunchNow Error:", error);
      return errorResponse(res, 500, error.message);
    }
  }

  static async getAllLaunchRequests(req, res) {
    try {
      const result = await LaunchNowTable.getAll();
      return successResponse(res, 200, "All launch requests fetched", result);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }
  
 static async deleteLaunchRequest(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return errorResponse(res, 400, "ID is required.");
    }

    const result = await LaunchNowTable.delete(id);

    if (result.affectedRows > 0) {
      return successResponse(res, 200, "Launch request deleted successfully.");
    } else {
      return errorResponse(res, 404, "Launch request not found.");
    }
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
}
}


export default LaunchNowController;
