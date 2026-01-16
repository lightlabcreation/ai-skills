import Controllers from "../Models/Model.js";

import { successResponse, errorResponse } from "../Utils/responseHandler.js";

import { notify } from "../notification.js"

const CourseSyllabusContTable = new Controllers("sub_title");

const CourseSyllabusTable = new Controllers("course_syllabus");

class CourseSyllabusContantCtrl {

    static async createCourseSyllCon(req, res) {
        try {
            const { course_syllabus_id, title } = req.body;


            const data = {
                course_syllabus_id,
                title,
            };


            const result = await CourseSyllabusContTable.create(data);
            if (result) {
                return successResponse(res, 200, "Course syllabus content created successfully", result);
            }
        } catch (error) {
            console.log(`Something went wrong: ${error}`);
            return errorResponse(res, 500, error.message);
        }
    }

    static async getByCourseSyllabusId(req, res) {
        try {
            const { course_syllabus_id } = req.params;
            if (!course_syllabus_id) {
                return errorResponse(res, 400, "Course syllabus id is required");
            }
            const result = await CourseSyllabusContTable.getByCourseSyllabusIdTest(course_syllabus_id);
            return successResponse(res, 200, "Course syllabus content fetched successfully", result);
        } catch (error) {
            console.log(`somthing went worng : ${error}`);
            return errorResponse(res, 500, error.message);
        }
    }

    static async deleteCourseSyllabus(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return errorResponse(res, 400, "Id is required");
            }
            const result = await CourseSyllabusContTable.delete(id);
            if (result) {
                return successResponse(res, 200, "Course syllabus content deleted successfully");
            }
        } catch (error) {
            console.log(`somthing went worng : ${error}`);
            return errorResponse(res, 500, error.message);
        }

    }

}

export default CourseSyllabusContantCtrl;
