import Controllers from "../Models/Model.js";

import { successResponse, errorResponse } from "../Utils/responseHandler.js";

import { notify } from "../notification.js"

const CartItemTable = new  Controllers("cart_items");

class CartItemCtrl{

    static async addToCart(req, res){
        try {
            const {user_id, course_id} = req.body;
            if(!user_id || !course_id ){
                return errorResponse(res, 400, "user_id, course_id is required");
            }
            const result = await CartItemTable.create({user_id, course_id});
            return successResponse(res, 200, "Course added to cart successfully", result);
        } catch (error) {
            console.log(`somthing went worng : ${error}`);
            return errorResponse(res, 500, error.message);
        }
    }

    static async getCartByUserId(req, res){
        try {
            const id = req.user_id;
            const {user_id} = req.params;
            if(!user_id){
                return errorResponse(res, 400, "user_id is required");
            }
            const result = await CartItemTable.getCart(user_id);
            return successResponse(res, 200, "Cart_items fetched successfully", result);
        } catch (error) {
            console.log(`somthing went worng : ${error}`);
            return errorResponse(res, 500, error.message);
        }
    }
    
    static async deleteCartItem(req, res){
        try {
            const {id} = req.params;
            if(!id){
                return errorResponse(res, 400, "cart_item_id is required");
            }
            const result = await CartItemTable.delete( id);
            return successResponse(res, 200, "Cart_item deleted successfully", result);
        } catch (error) {
            console.log(`somthing went worng : ${error}`);
            return errorResponse(res, 500, error.message);
        }
    }
 
}

export default CartItemCtrl;
