import Controllers from "../Models/Model.js";
import { successResponse, errorResponse } from "../Utils/responseHandler.js";

const paymentTable = new Controllers("payments");
const StudentTable = new Controllers("student");

class PaymentCtrl {

  static async createPayment(req, res) {
    try {
      const { studentId, cart_items, paypal_details, amount } = req.body;

      const data = {
        student_id: studentId,
        cart_items: JSON.stringify(cart_items),
        paypal_details: JSON.stringify(paypal_details),
        amount
      };

      const result = await paymentTable.create(data);
      return successResponse(res, 201, "Payment created successfully", result);
    } catch (error) {
      console.log("something went wrong : ", error);
      return errorResponse(res, 500, error.message);
    }
  }

  static async payments(req, res) {
    try {
      const { student_id } = req.query;

      let result;
      if (student_id) {
        result = await paymentTable.getByField("student_id", student_id);
      } else {
        result = await paymentTable.getAll();
      }

      const updatedResult = await Promise.all(
        result.map(async (row) => {
          const student_name = await StudentTable.getStudentNameById(row?.student_id);

          return {
            student_name: student_name?.name,
            ...row
          };
        })
      );

      return successResponse(res, 200, "Payments fetched successfully", updatedResult);
    } catch (error) {
      console.log("Something went wrong: ", error);
      return errorResponse(res, 500, error.message);
    }
  }
  
  static async DeletePayments(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return errorResponse(res, 400, "ID is required.");
      }

      const result = await paymentTable.delete(id);

      if (result.affectedRows > 0) {
        return successResponse(res, 200, "Payment deleted successfully.");
      } else {
        return errorResponse(res, 404, "Payment not found.");
      }
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }
}

export default PaymentCtrl;
