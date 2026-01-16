import Controllers from "../Models/Model.js";
import { successResponse, errorResponse } from "../Utils/responseHandler.js";
  
const enrollTable = new Controllers("courses");

class EnrollController {

  static async enrollCourse(req, res) {
    try {
      const { studentId, courseId, } = req.body;
      const data = { 
        student_id : studentId , 
        course_id : courseId, 
        payment_status : 'PAID'
    };
      const result = await enrollTable.create(data);
      return successResponse(res, 201, "Course enrolled successfully", result);
    } catch (error) {
      console.log("something went wrong : ", error);
      return errorResponse(res, 500, error.message);
    }
  }

  static async getEnrolledCoursesByStudentId(req,res){
    try {
        const { studentId } = req.params;
        const result = await enrollTable.getEnrollByStudntiId(studentId);
        return successResponse(res, 200, "Enrolled courses fetched successfully", result);
    } catch (error) {
        console.log("something went wrong : ", error);
        return errorResponse(res, 500, error.message);
    }
  }

}




export default EnrollController;
