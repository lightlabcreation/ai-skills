import Controllers from "../Models/Model.js";

import { successResponse, errorResponse } from "../Utils/responseHandler.js";

const CourseTable = new Controllers("courses");
const InstructorTable = new Controllers("instructor");
const StudentTable = new Controllers("student");
const ReviewTable = new Controllers("reviews");

class DashboardController {

  static async AdminDashboard(req, res) {
    try {
      const courseCount = await CourseTable.count();
      const activeInstructorCount = await InstructorTable.activeInstructor();;
      const inactiveInstructorCount = await InstructorTable.inactiveInstructor();
      const notVerifiedInstructorCount = await InstructorTable.isVerifiedInstructorCount(0);
      const studentCount = await StudentTable.count();

      const students = await StudentTable.last3Student();

      const studentWithCourses = await Promise.all(
        students.map(async student => {
          const courseIds = JSON.parse(student.course_id);

          const courses = await CourseTable.getStudentCourses(courseIds);
          const courseNames = courses.map(course => course.course_title);

          return {
            studentName: student.name,
            courseNames: courseNames.length > 0 ? courseNames.join(', ') : 'No Courses'
          };
        })
      );

      return successResponse(res, 200, "Dashboard data fetched", {
        totalCourses: courseCount,
        activeInstructorCount,
        inactiveInstructorCount,
        notVerifiedInstructorCount,
        totalStudents: studentCount,
        recentStudents: studentWithCourses
      });

    } catch (error) {
      console.log("something went wrong : ", error);
      return errorResponse(res, 500, error.message);
    }
  }

  static async instructorDashboard(req, res) {
    try {
      const { instructorId } = req.params;

      const courseCount = await CourseTable.countByInstructor(instructorId);
      const studentCount = await StudentTable.count();

      const fetchCourses = await CourseTable.getByInstructorId(instructorId);
      const courseIds = fetchCourses.map(course => course.id);

      const reviewStats = await ReviewTable.getAvgRatingByCourseIds(courseIds);

      // Merge course info with review stats
      const coursesWithRatings = fetchCourses.map(course => {
        const stats = reviewStats.find(r => r.course_id === course.id);
        return {
          // ...course,
          average_rating: stats?.average_rating || 0,
          total_reviews: stats?.total_reviews || 0
        };
      });

      return successResponse(res, 200, "Instructor dashboard data fetched", {
        totalCourses: courseCount,
        totalStudents: studentCount,
        fetchCourses: coursesWithRatings
      });

    } catch (error) {
      console.log("something went wrong : ", error);
      return errorResponse(res, 500, error.message);
    }
  }

}

export default DashboardController;
