import Controllers from "../Models/Model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

import { generateAccessToken } from "../Config/Jwt.js";
import { successResponse, errorResponse } from "../Utils/responseHandler.js";
import { encodeToken } from "../Utils/TokenEncode.js"

const studentTable = new Controllers("student");
const InstructorTable = new Controllers("instructor");
const AdminTable = new Controllers("admin");

class AuthController {
    static async register(req, res) {
        try {
            const { name, email, password, address, phone} = req.body;
            console.log("req.body", req.body);

            if (!name || !email || !password || !address || !phone) {
                return errorResponse(res, 400, "All fields are required.");
            }

            const existingUser = await AdminTable.findEmail(email);
            console.log("existingUser", existingUser);
            if (existingUser) {
                return errorResponse(res, 400, "Email already exists.");
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const img = req.uploadedImageUrl
            const role = "admin";
            const data = {
                name,
                email,
                password: hashedPassword,
                role : role,
                address,
                phone,
                avatar : img,
                is_active: role === "admin" ? "1" : "0",
            };

            const result = await AdminTable.create(data);

           const Admin_data = await AdminTable.getById(result?.insertId)
                 return successResponse(res, 201, "Admin created successfully", Admin_data );
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    static async logins(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return errorResponse(res, 400, "All fields are required.");
            }
            let existingUser = await studentTable.findEmail(email);
            console.log("existingUser", existingUser);
            if (!existingUser) {
                existingUser = await InstructorTable.findEmail(email);
            }

            if (!existingUser) {
                existingUser = await AdminTable.findEmail(email);
            }

            if (!existingUser) {
                return errorResponse(res, 404, "Invalid email or password.");
            }


            const isPasswordValid = await bcrypt.compare(password, existingUser.password);
            if (!isPasswordValid) {
                return errorResponse(res, 404, "Invalid email or password");
            }


            if (existingUser.role === "student" || existingUser.role === "instructor") {
                if (Number(existingUser.is_active) !== 1) {
                    return errorResponse(res, 403, "You are not active. Please contact admin.");
                }
                if (existingUser.role === "instructor" && Number(existingUser.is_verified) !== 1) {
                    return errorResponse(res, 403, "You are not verified. Please contact admin.");
                }
            }
            if (existingUser.role == "admin") {
                if (existingUser.is_active !== 1) {
                    return errorResponse(res, 201, "You are not activate please contact super admin.");
                }
            }

            const accessToken = generateAccessToken({ id: existingUser.id, role: existingUser.role });
            const encodedaccessToken = await encodeToken(accessToken)
            res.cookie("accessToken", encodedaccessToken, {
                httpOnly: true,
                maxAge: 7 * 24 * 60 * 60 * 1000,
                sameSite: "Strict",
            });

            return successResponse(res, 200, "Login successful.", { encodedaccessToken });
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    static async updateStatus(req,res){
        try {
            const {id} = req.params
            const { is_active} = req.body;
            console.log("status : ", is_active);
            const user = await AdminTable.getById(id);
            console.log('users : ', user);
            if (!user) {
                return errorResponse(res, 404, "User not found");
            }
            const result = await AdminTable.updateStatus(id,  is_active );
            return successResponse(res, 200, "User status updated successfully", result);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    static async fetchData(req, res) {
        try {
            const auth = req.user;

            if (!auth) {
                return errorResponse(res, 401, "Token missing or invalid");
            }

            let user;

            if (auth.role === "admin") {
                user = await AdminTable.getById(auth.id);
            } else if (auth.role === "instructor") {
                user = await InstructorTable.getById(auth.id);
            } else if (auth.role === "student") {
                user = await studentTable.getById(auth.id);
            } else if (auth.role === "superadmin"){
                user = await AdminTable.getById(auth.id);
            }else {
                return errorResponse(res, 400, "Invalid user role");
            }

            if (!user) {
                return errorResponse(res, 404, "User not found");
            }

            return successResponse(res, 200, "User data fetched successfully", user);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    static async fetchUsers(req, res) {
        try {
            const [students, instructors, admins] = await Promise.all([
                studentTable.getAll(),
                InstructorTable.getAll(),
                AdminTable.getAll()
            ]);
    
            const users = [
                ...students.map(student => ({
                    id: student.id,
                    name: student.name,
                    email: student.email,
                    role: "student",
                    mobile: student.mobile,
                    profile_image: "https://res.cloudinary.com/dkqcqrrbp/image/upload/v1746865926/m7zzqqvhrrea8ynsinev.png",
                    created_at: student.created_at,
                    updated_at: student.updated_at
                })),
                ...instructors.map(instructor => ({
                    id: instructor.id,
                    name: instructor.full_name,
                    email: instructor.email,
                    role: "instructor",
                    mobile: instructor.mobile_number,
                    profile_image: instructor.profile_image,   
                    expertise: instructor.expertise,
                    created_at: instructor.created_at,
                    updated_at: instructor.updated_at
                })),
                ...admins.map(admin => ({
                    id: admin.id,
                    name: admin.name,
                    email: admin.email,
                    profile_image: "https://res.cloudinary.com/dkqcqrrbp/image/upload/v1746865926/m7zzqqvhrrea8ynsinev.png",
                    role: "admin",
                    created_at: admin.created_at,
                    updated_at: admin.updated_at
                }))
            ];
    
            return successResponse(res, 200, "User data fetched successfully", users);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    static async getByIdAdmin (req,res){
        try {
            const {id} = req.params;
            const admin = await AdminTable.getById(id);
            return successResponse(res, 200, "User data fetched successfully", admin);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    static async updateAdmin (req, res){
        try {
            const {id} = req.params
            const {name, email, address, phone} = req.body;
            const img = req.uploadedImageUrl
            const data = {
                name,
                email,
                address,
                phone,
                avatar : img,
            };
            const admin = await AdminTable.update(id, data)
            return successResponse(res, 200, "User data fetched successfully");
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    static async fetchAllAdmins(_, res) {
        try {
            const [admins] = await Promise.all([
                AdminTable.getAllByRole("admin")
            ]);
    
            return successResponse(res, 200, "User data fetched successfully", admins);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }
    
    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;

            const findStudentEmail = await studentTable.findEmail(email);
            let findInstructorEmail = null;
            let userType = '';
            let updateTokenResult = null;

            const token = crypto.randomBytes(32).toString('hex');
            const expiry = Date.now() + 15 * 60 * 1000;

            if (findStudentEmail) {
                userType = 'student';
                updateTokenResult = await studentTable.updateByEmail(email, {
                    forgot_password_token: token,
                    reset_token_expiry: expiry,
                });
            } else {
                findInstructorEmail = await InstructorTable.findEmail(email);
                if (!findInstructorEmail) {
                    return errorResponse(res, 200, "User not found with this email.");
                }
                userType = 'instructor';
                updateTokenResult = await InstructorTable.updateByEmail(email, {
                    forgot_password_token: token,
                    reset_token_expiry: expiry,
                });
            }

            return successResponse(res, 200, "Password reset token generated successfully", {
                email,
                token,
                userType,
            });
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    static async resetPassword(req, res) {
        try {
            const { email, token, newPassword } = req.body;

            if (!email || !token || !newPassword) {
                return errorResponse(res, 400, "Email, token and new password are required.");
            }

            const student = await studentTable.findEmail(email);
            const instructor = student ? null : await InstructorTable.findEmail(email);

            const user = student || instructor;

            if (!user) {
                return errorResponse(res, 404, "User not found.");
            }

            const storedToken = user.forgot_password_token;
            const tokenExpiry = user.reset_token_expiry;

            if (!storedToken || tokenExpiry < Date.now()) {
                return errorResponse(res, 400, "Token expired or invalid.");
            }

            if (storedToken !== token) {
                return errorResponse(res, 400, "Invalid reset token.");
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            const updateData = {
                password: hashedPassword,
                forgot_password_token: null,
                reset_token_expiry: null,
            };

            if (student) {
                await studentTable.updateByEmail(email, updateData);
            } else {
                await InstructorTable.updateByEmail(email, updateData);
            }

            return successResponse(res, 200, "Password reset successful.");

        } catch (error) {
            return errorResponse(res, 500, error.message);
        }

    }

    static async changePassword(req, res) {
        try {
            const auth = req.user;
            const { oldPassword, newPassword } = req.body;
    
            if (!oldPassword || !newPassword) {
                return errorResponse(res, 400, "Old password and new password are required.");
            }
    
            if (!auth) {
                return errorResponse(res, 401, "Token missing or invalid");
            }
    
            if (oldPassword === newPassword) {
                return errorResponse(res, 400, "New password must be different from old password.");
            }
    
            let user;
    
            if (auth.role === "admin" || auth.role === "superadmin") {
                user = await AdminTable.getById(auth.id);
            } else if (auth.role === "instructor") {
                user = await InstructorTable.getById(auth.id);
            } else if (auth.role === "student") {
                user = await studentTable.getById(auth.id);
            } else {
                return errorResponse(res, 400, "Invalid user role");
            }
    
            if (!user) {
                return errorResponse(res, 404, "User not found");
            }
    
            const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
            if (!isPasswordValid) {
                return errorResponse(res, 400, "Invalid old password.");
            }
    
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const updateData = { password: hashedPassword };
    
            if (auth.role === "student") {
                await studentTable.updateByEmail(user.email, updateData);
            } else if (auth.role === "instructor") {
                await InstructorTable.updateByEmail(user.email, updateData);
            } else {
                await AdminTable.updateByEmail(user.email, updateData);
            }
    
            return successResponse(res, 200, "Password changed successfully.");
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }
    
}

export default AuthController;
