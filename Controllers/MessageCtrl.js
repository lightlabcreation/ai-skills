import { Server } from "socket.io";
import Controllers from "../Models/Model.js";

const MessageTable = new Controllers("messages");
const UserTable = new Controllers("instructor");
const StudentTable = new Controllers("student");
const AdminTable = new Controllers("admin");

export const setupSocket = (io) => {
    io.on("connection", (socket) => {
        console.log("✅ User connected:", socket.id);

        socket.on("send_message", async (data) => {
            try {
                const { senderId, receiverId, message } = data;

                const newMessage = await MessageTable.create({
                    sender_id: senderId,
                    receiver_id: receiverId,
                    message
                });

                const savedMessage = await MessageTable.getById(newMessage.insertId);

                io.emit("new_message", savedMessage);
                socket.emit("message_sent", savedMessage);
            } catch (err) {
                console.error("Error sending message:", err);
                socket.emit("message_error", { error: "Message sending failed", details: err.message });
            }
        });


        socket.on("get_messages", async (data) => {
            try {
                const { sender_id, receiver_id } = data;

                // The 'await' call now works correctly
                const messages = await MessageTable.getMessagesBetweenUsers({
                    sender_id,
                    receiver_id,
                });
                console.log("mes", messages);
                socket.emit("messages", messages);

            } catch (err) {
                console.error("Error fetching messages:", err);
                socket.emit("message_error", {
                    error: "Failed to fetch messages",
                    details: err.message
                });
            }
        });




        // socket.on("get_users", async () => {
        //     try {
        //         const users = await UserTable.getAll();
        //         const admin = await AdminTable.getAll();
        //         const student = await StudentTable.getAll();
        //         socket.emit("users", [...users,...admin,...student]);
        //     } catch (err) {
        //         socket.emit("user_error", { error: "Failed to fetch users", details: err.message });
        //     }
        // });

        socket.on("get_users", async () => {
    try {
        const users = await UserTable.getAll();
        const admin = await AdminTable.getAll();
        const student = await StudentTable.getAll();

        const result = [...users, ...admin, ...student];

        const updatedResult = await Promise.all(
            result.map(async (row) => {
                const lastMessage = await MessageTable.getLastMessageByUserId(row.id);
                return {
                    ...row,
                    lastMessage,
                };
            })
        );

        socket.emit("users", updatedResult);
    } catch (err) {
        socket.emit("user_error", {
            error: "Failed to fetch users",
            details: err.message
        });
    }
});

        socket.on("disconnect", () => {
            console.log("❌ User disconnected:", socket.id);
        });
    });
};
