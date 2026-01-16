import Controllers from "../Models/Model.js";
import { quiz_function } from "../service/quiz_AI.js";
import { successResponse, errorResponse } from "../Utils/responseHandler.js";


const courseSyllabusTable = new Controllers("course_syllabus");
const AiQuizTable = new Controllers("AiQuizTable");
class AiQuizeCtrl{
    static async createQuize(req, res) {
        try {
            const {id, topic, number_questions } = req.body;
            const quizData = await quiz_function(topic, number_questions);
            const questions = quizData;
           console.log("questions : ",questions);
            const insertedRecords = [];
    
            for (const q of questions) {
                const record = await AiQuizTable.create({
                    course_syllabus_id:id,
                    topic,
                    question: q.question,
                    option: JSON.stringify(q.options), // Make sure DB column type supports this
                    correctAnswerOption: q.correctAnswerOption
                });
    
                insertedRecords.push(record);
            }
    
            return successResponse(res, 200, "Quiz created successfully",);
        } catch (error) {
            console.error("Quiz creation error:", error);
            return errorResponse(res, 500, error.message);
        }
    }

    static async getQuiz(req, res) {
        try {
            const {course_syllabus_id} = req.params;
            const quize = await AiQuizTable.getByCourseSyllabusId(course_syllabus_id);
            return successResponse(res, 200, "Quiz fetched successfully", quize);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    static async deleteQuiz(req, res) {
        try {
            const {id} = req.params;
            const quize = await AiQuizTable.delete(id);
            return successResponse(res, 200, "Quiz deleted successfully", quize);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

      

}


export default AiQuizeCtrl;