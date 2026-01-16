import Controllers from "../Models/Model.js";

import { successResponse, errorResponse } from "../Utils/responseHandler.js";

import { notify } from "../notification.js"

const CourseTable = new Controllers("courses");

const InstructorTable = new Controllers("instructor");

const CategoryTable = new Controllers("category");
const TestTable = new Controllers("tests");

const CourseSyllabusTable = new Controllers("course_syllabus");
const CourseSyllabusContTable = new Controllers("sub_title");
const AiQuizTable = new Controllers("AiQuizTable");
const TestQuestion = new Controllers("test_questions");
class CourseController {

  static async getAllCourses(req, res) {
    try {
      const { id, instructor_id } = req.query;

      if (id) {
        const result = await CourseTable.getById(id);
        if (!result) {
          return errorResponse(res, 404, "No course found for this ID.");
        }

        const category_name = await CategoryTable.findCategoryById(result.category_id);
        const instructor_details = await InstructorTable.findInstructorById(result.instructor_id);
        const tests = await TestTable.getByCourseId(id); // ✅ Get tests for single course
        const course_syllabus = await CourseSyllabusTable.getByCourseSyllabusId(result.id);

        const questionsNested = await Promise.all(
          (tests || []).map(async (test) => {
            const questionIds = test.questions?.split(',').map((id) => parseInt(id)) || [];
            return questionIds.length
              ? await TestQuestion.getByIds(questionIds)
              : [];
          })
        );

        const flatQuestions = questionsNested.flat(); 

        return successResponse(res, 200, "Single course fetched successfully", {
          ...result,
          category_name,
          instructor_details,
          tests: flatQuestions,
          course_syllabus
        });
      }
      let result = [];
      if (instructor_id) {
        result = await CourseTable.getByInstructorId(instructor_id);
      } else {
        result = await CourseTable.getAll();
      }

      const resultArray = Array.isArray(result) ? result : [result];

      if (!resultArray || resultArray.length === 0) {
        return errorResponse(res, 404, "No courses found.");
      }
      const updatedResult = await Promise.all(
        resultArray.map(async (row) => {
          const category_name = await CategoryTable.findCategoryById(row.category_id);
          const instructor_details = await InstructorTable.findInstructorById(row.instructor_id);
          const tests = await TestTable.getByCourseId(row.id);
          const course_syllabus = await CourseSyllabusTable.getByCourseSyllabusId(row.id);

          const questionsNested = await Promise.all(
            (tests || []).map(async (test) => {
              const questionIds = test.questions?.split(',').map((id) => parseInt(id)) || [];
              return questionIds.length
                ? await TestQuestion.getByIds(questionIds)
                : [];
            })
          );

          const flatQuestions = questionsNested.flat(); 

          return {
            ...row,
            category_name,
            instructor_details,
            tests: flatQuestions,
            course_syllabus
          };
        })
      );

      return successResponse(res, 200, "Courses fetched successfully", updatedResult);
    } catch (error) {
      console.log("something went wrong : ", error);
      return errorResponse(res, 500, error.message);
    }
  }


  static async getcoursebyCategoryId(req, res) {
    try {
      const { category_id } = req.params

      const result = await CourseTable.getAll(category_id)
      return successResponse(res, 201, "Course fethed successfully", result);

    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async createCourse(req, res) {
    try {
      const {
        course_title,
        course_description,
        course_syllabus,
        course_content_video_link,
        faqs,
        status,
        instructor_id,
        category_id,
        course_type,
        course_price,
        fcmToken
      } = req.body;
      console.log("req.body ", req.body);
      const course_image = req.uploadedImageUrl;
      const test_video = req.uploadedVideoUrl;

      if (
        !course_title ||
        !course_description ||
        !course_image ||
        !course_syllabus ||
        !course_content_video_link ||
        !test_video ||
        !faqs ||
        !status ||
        !category_id ||
        !course_type ||
        !course_price
      ) {
        return errorResponse(res, 400, "All required fields must be filled.");
      }

      const result = await CourseTable.create({
        course_title,
        course_description,
        course_image,
        course_content_video_link,
        test_video,
        faqs,
        status,
        instructor_id,
        category_id,
        course_type,
        course_price,
        fcmToken: fcmToken || null
      });

      if (!result) {
        return errorResponse(res, 500, "Failed to create course.");
      }
      console.log("result ", result);
      console.log(course_syllabus, "course_syllabus");
      const parsedSyllabus = typeof course_syllabus === 'string' ? JSON.parse(course_syllabus) : course_syllabus;
      console.log("parsedSyllabus ", parsedSyllabus);
      for (let module of parsedSyllabus) {
        const ress = await CourseSyllabusTable.create({
          course_id: result?.insertId,
          module_title: module.module_title,
          module_syllabus: module.module_syllabus,
          // module_courses: module.module_courses,
          created_at: new Date()
        });
        console.log("ress ", ress);
      }

      // FCM Notification
      if (fcmToken) {
        const message = {
          notification: {
            title: `New Course ${course_title}`,
            body: `${course_title} is now available!`,
          },
          token: fcmToken,
        };

        try {
          const response = await notify.messaging().send(message);
          console.log("Notification Sent:", response);
        } catch (error) {
          console.error("Notification Error:", error);
          // Not failing response just because of notification
        }
      }

      return successResponse(res, 201, "Course created successfully", result);

    } catch (error) {
      console.log("error ", error);

      return errorResponse(res, 500, error.message);
    }
  }

  static async editCourse(req, res) {
    try {
      const { id } = req.params;
      const {
        course_title,
        course_description,
        course_syllabus,
        course_content_video_link,
        faqs,
        status,
        instructor,
        category_id,
        course_type,
        course_price
      } = req.body;
      if (!id) {
        return errorResponse(res, 400, "Course ID is required.");
      }

      const existingCourse = await CourseTable.getById(id);
      if (!existingCourse) {
        return errorResponse(res, 404, "Course not found.");
      }

      const updatedData = {};

      if (course_title) updatedData.course_title = course_title;
      if (course_description) updatedData.course_description = course_description;
      if (course_content_video_link) updatedData.course_content_video_link = course_content_video_link;
      if (faqs) updatedData.faqs = faqs;
      if (status) updatedData.status = status;
      if (instructor) updatedData.instructor_id = instructor;
      if (category_id) updatedData.category_id = category_id;
      if (course_type) updatedData.course_type = course_type;
      if (course_price) updatedData.course_price = course_price;

      const course_image = req.uploadedImageUrl;
      const test_video = req.uploadedVideoUrl;

      if (course_image) updatedData.course_image = course_image;
      if (test_video) updatedData.test_video = test_video;

      const result = await CourseTable.update(id, updatedData);

      if (course_syllabus) {
        const parsedSyllabus = typeof course_syllabus === 'string' ? JSON.parse(course_syllabus) : course_syllabus;

        for (let module of parsedSyllabus) {
          if (module.id) {
            await CourseSyllabusTable.update(module.id, {
              course_id: module.course_id,
              module_title: module.module_title,
              module_syllabus: module.module_syllabus,
              module_courses: module.module_courses
            });
          } else {
            await CourseSyllabusTable.create({
              course_id: id,
              module_title: module.module_title,
              module_syllabus: module.module_syllabus,
              module_courses: module.module_courses,
              created_at: new Date()
            });
          }
        }
      }

      if (result.affectedRows === 0) {
        return errorResponse(res, 400, "Update failed.");
      }

      return successResponse(res, 200, "Course updated successfully", result);
    } catch (error) {
      console.log("error ", error);
      return errorResponse(res, 500, error.message);
    }
  }

  static async publishCourse(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!id) {
        return errorResponse(res, 400, "Course ID is required.");
      }

      if (!status) {
        return errorResponse(res, 400, "status must be required.");
      }

      const result = await CourseTable.update(id, { status });

      if (result.affectedRows > 0) {
        return successResponse(res, 200, "Course published successfully.");
      } else {
        return errorResponse(res, 404, "Course not found.");
      }
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async deleteCourse(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return errorResponse(res, 400, "Course ID is required.");
      }

      const result = await CourseTable.delete(id);
      const syllabusRecords = await CourseSyllabusTable.getONLYId("course_id", id);

      await CourseSyllabusTable.deleteByCourseId(id);

      if (syllabusRecords && syllabusRecords.length > 0) {
        for (let i = 0; i < syllabusRecords.length; i++) {
          const syllabusId = syllabusRecords[i].id;
          await AiQuizTable.deleteByFields("course_syllabus_id", syllabusId);
          await CourseSyllabusContTable.deleteByFields("course_syllabus_id", syllabusId);
        }
      }

      if (result.affectedRows > 0) {
        return successResponse(res, 200, "Course deleted successfully");
      } else {
        return errorResponse(res, 404, "Course not found.");
      }
    } catch (error) {
      console.error("Delete course error:", error);
      return errorResponse(res, 500, error.message);
    }
  }
}

export default CourseController;
