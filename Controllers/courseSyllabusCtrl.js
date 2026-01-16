import Controllers from "../Models/Model.js";

import { successResponse, errorResponse } from "../Utils/responseHandler.js";

import { notify } from "../notification.js"

const CourseSyllabusContTable = new Controllers("sub_title");

const CourseSyllabusTable = new  Controllers("course_syllabus");

class CourseSyllabusCtrl {

    static async getCourseSyllabusById (req, res){
        try {
            const {id} = req.params;
            if(!id){
                return errorResponse(res, 400, "Course id is required");
            }
            const result = await CourseSyllabusTable.getById(id);
            return successResponse(res, 200, "Course syllabus fetched successfully", result);
        } catch (error) {
            console.log(`somthing went worng : ${error}`);
            return errorResponse(res, 500, error.message);
        }
    }


    static async getCourseSyllabusTitileById (req, res){
        try {
            const {id} = req.params;
            if(!id){
                return errorResponse(res, 400, "Course id is required");
            }
            const result = await CourseSyllabusTable.getById(id);
            console.log("result : ", result);
            return successResponse(res, 200, "Course syllabus fetched successfully", result);
        } catch (error) {
            console.log(`somthing went worng : ${error}`);
            return errorResponse(res, 500, error.message);
        }
    }
    
    
 
}

export default CourseSyllabusCtrl;
