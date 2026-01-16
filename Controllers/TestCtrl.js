import Controllers from "../Models/Model.js";
import { successResponse, errorResponse } from "../Utils/responseHandler.js";

const TestTable = new Controllers("tests");
const AdminTable = new Controllers("admin");
const CourseTable = new Controllers("courses");
const StudentTable = new Controllers("student");
const TestQuestion = new Controllers("test_questions");
const submitTestTable = new Controllers("submit_test");
const student = new Controllers("student");
class CategoryController {

    static async createTest(req, res) {
        try {
            const { course_id, questions, created_by } = req.body;

            if (!course_id || !created_by || !Array.isArray(questions) || questions.length === 0) {
                return errorResponse(res, 400, "All fields are required and questions must be a non-empty array.");
            }

            const createdTests = [];

            for (const q of questions) {
                if (
                    !q.question || !q.option1 || !q.option2 || !q.option3 || !q.option4 || !q.correct_option
                ) {
                    return errorResponse(res, 400, "Each question must have all fields: question, 4 options, and correct_option.");
                }

                // ✅ First insert question
                const newQuestion = await TestQuestion.create({
                    question: q.question,
                    option1: q.option1,
                    option2: q.option2,
                    option3: q.option3,
                    option4: q.option4,
                    correct_option: q.correct_option,
                });

                const questionId = newQuestion.insertId;

                const newTest = await TestTable.create({
                    course_id,
                    questions: questionId.toString(),
                    created_by,
                });

                createdTests.push(newTest);
            }

            return successResponse(res, 201, "All test records created successfully", createdTests);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    static async fetchTests(req, res) {
        try {
            const { course_id } = req.query;
            let result;

            if (course_id) {
                result = await TestTable.getById("course_id", course_id);
            } else {
                result = await TestTable.getAll();
            }

            if (!result || result.length === 0) {
                return errorResponse(res, 404, "No Tests found.");
            }

            const parsedResult = result.map((test) => {
                let parsedQuestions;
                try {
                    parsedQuestions = JSON.parse(test.questions);
                } catch (err) {
                    parsedQuestions = [];
                }

                return {
                    ...test,
                    questions: parsedQuestions,
                };
            });

            const updatedResults = await Promise.all(
                parsedResult.map(async (row) => {
                    const created_by = await AdminTable.getById(row.created_by);
                    const course_id = await CourseTable.getById(row.course_id);

                    return {
                        ...row,
                        created_by: created_by?.name || "Unknown Admin",
                        course_name: course_id?.course_title || "Unknown Course",

                    };
                })
            );

            return successResponse(res, 200, "Tests fetched successfully", updatedResults);
        } catch (error) {
            console.error(error);
            return errorResponse(res, 500, error.message);
        }
    }

    static async deletetestquestion(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return errorResponse(res, 400, "Test ID is required.");
            }

            const test = await TestQuestion.getById(id);
            if (!test) {
                return errorResponse(res, 404, "TestQuestion not found.");
            }

            await TestQuestion.delete(id);
            return successResponse(res, 200, "TestQuestion deleted successfully.");
        } catch (error) {
            console.error(error);
            return errorResponse(res, 500, error.message);
        }
    }


    static async submittest(req, res) {
        try {
            const { course_id, student_id, test } = req.body;

            if (!course_id || !student_id || !Array.isArray(test) || test.length === 0) {
                return errorResponse(res, 400, "Invalid data submitted.");
            }

            // Step 1: Delete previous submissions for this student + course
            const existingTests = await submitTestTable.findByStudentAndCourse(student_id, course_id);
            if (existingTests && existingTests.length > 0) {
                await submitTestTable.deleteByStudentAndCourse(student_id, course_id);
            }

            // Step 2: Prepare data
            const insertData = test.map(item => ({
                course_id,
                student_id,
                question_id: item.question_id,
                answer: item.answer,
                is_correct: item.is_correct || "0",
                created_at: new Date()
            }));

            // Step 3: Bulk Insert
            await submitTestTable.bulkInsert(insertData);

            return successResponse(res, 200, "Test submitted successfully.");
        } catch (error) {
            console.error(error);
            return errorResponse(res, 500, error.message);
        }
    }


    static async fetchStudentRecord(req, res) {
        try {
            const { student_id } = req.params;

            if (!student_id) {
                return errorResponse(res, 400, "Student ID is required.");
            }

            const test = await submitTestTable.findStudentById(student_id);

            if (!test || test.length === 0) {
                return errorResponse(res, 404, "No test records found for this student.");
            }

            // Group by course_id
            const courseWise = {};
            for (const record of test) {
                const courseId = record.course_id;
                if (!courseWise[courseId]) {
                    courseWise[courseId] = [];
                }
                courseWise[courseId].push(record);
            }

            // Fetch student name once
            const student_name = await StudentTable.getStudentNameById(student_id);

            const result = [];

            for (const course_id in courseWise) {
                const records = courseWise[course_id];
                const total_attempts = records.length;
                const correct_answers = records.filter(r => r.is_correct === "1" || r.is_correct === 1).length;
                const incorrect_answers = total_attempts - correct_answers;
                const accuracy_percent = Math.round((correct_answers / total_attempts) * 100);

                const course_name = await CourseTable.getByCourseIdTest(course_id);

                result.push({
                    course_id,
                    course_name: course_name[0]?.course_title,
                    student_id,
                    student_name: student_name.name,
                    total_attempts,
                    correct_answers,
                    incorrect_answers,
                    accuracy_percent
                });
            }

            return successResponse(res, 200, "Test fetched successfully", result);

        } catch (error) {
            console.error(error);
            return errorResponse(res, 500, error.message);
        }
    }



}

export default CategoryController;
