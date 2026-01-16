import Controllers from "../Models/Model.js";
import { successResponse, errorResponse } from "../Utils/responseHandler.js";
  
const CourseReviewTable = new Controllers("course_reviews");



class CourseReviewController {
 static async AddReview(req, res) {
  try {
   const { studentId, courseId, rating, review } = req.body;
     

   const reviewData = {
    course_id : courseId,
    student_id :studentId ,
    review,
    rating
   };

   const result = await CourseReviewTable.create(reviewData);
   return successResponse(res, 201, "Review added successfully", result);
  } catch (error) {
   console.error(error);
   return errorResponse(res, 500, "Internal server error");
  }
 }

 static async getReviewByCourseId(req, res) {
  try {
   const { courseId } = req.params;
   const result = await CourseReviewTable.getById(courseId);
   const response = await Promise.all(result.map(async (review) => {
    const student = await CourseReviewTable.getById(review.student_id);
    return {
     ...review,
     student
    };
   }));
   return successResponse(res, 200, "Review fetched successfully", result);
  } catch (error) {
   console.error(error);
   return errorResponse(res, 500, "Internal server error");
  }
 }

  
}




export default CourseReviewController;
