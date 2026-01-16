import Controllers from "../Models/Model.js";
import bcrypt from "bcrypt";

import { successResponse, errorResponse } from "../Utils/responseHandler.js";

const studentTable = new Controllers("student");

class StudentController {

  static async getAllStudents(req, res) {
    try {
      const { id } = req.query;

      let rawResult;
      if (id) {
        rawResult = await studentTable.getById(id);
        console.log("rawResult : ",rawResult)
      } else {

        rawResult = await studentTable.getAll();
        console.log("rawResult : ",rawResult)
      }

      if (!rawResult) {
        return errorResponse(res, 404, "No student(s) found.");
      }

      // Group courses under each student
      // const studentMap = {};

      // for (const row of rawResult) {
      //   const studentId = row.student_id;

      //   if (!studentMap[studentId]) {
      //     studentMap[studentId] = {
      //       id: studentId,
      //       student_name: row.student_name,
      //       email: row.email,
      //       mobile: row.mobile,
      //       is_active: row.is_active,
      //       courses: [],
      //     };
      //   }

      //   studentMap[studentId].courses.push({
      //     course_id: row.course_id,
      //     course_title: row.course_title,
      //     course_description: row.course_description,
      //     course_image: row.course_image,
      //     course_type: row.course_type,
      //     course_price: row.course_price,
      //     course_syllabus: JSON.parse(row.course_syllabus || '[]'),
      //     course_content_video_link: row.course_content_video_link,
      //     test_video: row.test_video,
      //     faqs: JSON.parse(row.faqs || '[]'),
      //     status: row.status,
      //     category_id: row.category_id,
      //     instructor_id: row.instructor_id
      //   });
      // }

      // const formattedResult = Object.values(studentMap);

      // const updatedResult = await Promise.all(
      //   formattedResult.map(async (student) => {
      //     const coursesWithCategory = await Promise.all(
      //       student.courses.map(async (course) => {
      //         const category_name = await studentTable.findCategoryById(course.category_id);
      //         const instructor_name = await studentTable.findInstructorById(course.instructor_id);
      //         return {
      //           ...course,
      //           category_name,
      //           instructor_name,
      //         };
      //       })
      //     );

      //     return {
      //       ...student,
      //       courses: coursesWithCategory,
      //     };
      //   })
      // );

      return successResponse(res, 200, "Students fetched successfully", rawResult);

    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async createStudent(req, res) {
    try {
      const { name, email, password, confirmPassword, mobile, course_id } = req.body;
      console.log("req.body ", req.body);
      const img = req.uploadedImageUrl
      console.log("img ", img);

      if (!name || !email || !password || !confirmPassword || !mobile || !course_id) {
        return errorResponse(res, 400, "All required fields must be filled.");
      }

      if (password !== confirmPassword) {
        return errorResponse(res, 400, "Passwords do not match.");
      }

      const existingUser = await studentTable.findEmail(email);
      if (existingUser) {
        return errorResponse(res, 409, "Email already in use.");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await studentTable.create({
        name,
        email,
        password: hashedPassword,
        mobile,
        course_id,
        avatar : img,
      });

      const student_data = await studentTable.getById(result?.insertId)
      return successResponse(res, 201, "Student created successfully", student_data);
    } catch (error) {
      console.log("error ", error); 
      return errorResponse(res, 500, error.message);
    }
  }

  static async editStudent(req, res) {
    try {
      const { id } = req.params;
      const { name, email, mobile, password, is_active, course_id } = req.body;
      const img = req.uploadedImageUrl
      console.log("img ", img);
      if (!id) {
        return errorResponse(res, 400, "User ID is required.");
      }

      const existingUser = await studentTable.getById(id);
      if (!existingUser) {
        return errorResponse(res, 404, "User not found.");
      }

      const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

      const updatedData = {};
      if (name) updatedData.name = name;
      if (email) updatedData.email = email;
      if (mobile) updatedData.mobile = mobile;
      if (course_id) updatedData.course_id = course_id;
      if (typeof is_active === "boolean") updatedData.is_active = is_active;
      if(img) updatedData.avatar = img;
      if (password) updatedData.password = hashedPassword;

      const result = await studentTable.update(id, updatedData);
      if (result.affectedRows === 0) {
        return errorResponse(res, 400, "Update failed.");
      }

      return successResponse(res, 200, "User updated successfully", result);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async studentStatus(req, res) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;

      if (!id) {
        return errorResponse(res, 400, "student ID is required.");
      }
      if (!is_active) {
        return errorResponse(res, 400, "is_active must be required.");
      }
      console.log("is_active", is_active);

      const result = await studentTable.update(id, { is_active });

      if (result.affectedRows > 0) {
        return successResponse(res, 200, "student updated successfully.");
      } else {
        return errorResponse(res, 404, "student not found.");
      }
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async updateStudentPassword(req, res) {
    try {
      const { id } = req.params;
      const { password } = req.body;

      if (!id) {
        return errorResponse(res, 400, "student ID is required.");
      }
      if (!password) {
        return errorResponse(res, 400, "password must be required.");
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log("hashedPassword", hashedPassword);
      console.log("password", password);

      const result = await studentTable.update(id, { password: hashedPassword });

      if (result.affectedRows > 0) {
        return successResponse(res, 200, "student password updated successfully.");
      } else {
        return errorResponse(res, 404, "student not found.");
      }
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async deleteStudent(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return errorResponse(res, 400, "User ID is required.");
      }

      const result = await studentTable.delete(id);

      if (result.affectedRows > 0) {
        return successResponse(res, 200, "User deleted successfully");
      } else {
        return errorResponse(res, 404, "User not found.");
      }
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }
}

export default StudentController;
