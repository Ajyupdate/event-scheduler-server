import { Router } from "express";
import Tasks from "../models/tasks.js";
const router = Router();
router.post("", (request, response) => {
    const { title, startTime, endTime, date, owner, completed } = request.body;
    if (title && startTime && endTime) {
        const originalDate = new Date(date);
        const options = {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "2-digit",
        };
        const formattedDate = originalDate.toLocaleDateString("en-US", options);
        //  Create a new Date object for the current date
        const currentDate = new Date();
        let taskDate;
        // Check if the formattedDate matches today's date
        const currentFormattedDate = currentDate.toLocaleDateString("en-US", options);
        const formattedYear = parseInt(formattedDate.substring(11, 16), 10);
        const formattedMonth = formattedDate.substring(4, 8);
        const formattedDay = parseInt(formattedDate.substring(8, 10), 10);
        // Extract the date components from the current date
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentFormattedDate.substring(4, 8);
        const currentDay = currentDate.getDate();
        if (formattedYear === currentYear &&
            formattedMonth === currentMonth &&
            formattedDay === currentDay) {
            taskDate = "Today";
        }
        else {
            taskDate = formattedDate;
        }
        const newTodo = new Tasks({
            title,
            startTime,
            endTime,
            date: formattedDate,
            owner,
            completed,
        });
        newTodo.save().then(result => {
            response.json({
                status: "SUCCESS",
                message: "New Task added successfully",
                data: result,
            });
        })
            .catch(err => {
            response.json({
                status: "FAILED",
                message: "An error while saving user"
            });
        });
    }
});
router.get("/:id", async (request, response) => {
    const { id } = request.params;
    const requestedDate = request.query.date;
    console.log(requestedDate);
    try {
        const product = await Tasks.find({ owner: id, date: requestedDate });
        response.json({
            status: "SUCCESS",
            data: product
        });
    }
    catch (err) {
        response.json({
            status: "FAILED",
            message: "Something went wrong",
        });
    }
});
router.patch("/:id", async (request, response) => {
    const { id } = request.params;
    const updatedData = request.body;
    try {
        const updatedTask = await Tasks.findByIdAndUpdate(id, updatedData, { new: true } // Return the updated document
        );
        if (!updatedTask) {
            return response.status(404).json({ message: "Task not founddd" });
        }
        response.json({
            status: "SUCCESS",
            data: updatedTask
        });
    }
    catch (error) {
        response.status(500).json({ message: "Error updating product" });
        console.log(error);
    }
});
router.delete("/:id", async (request, response) => {
    const { id } = request.params;
    try {
        const deletedTask = await Tasks.findByIdAndDelete(id);
        if (!deletedTask) {
            return response.status(404).json({ message: "Task not found" });
        }
        response.json({
            status: "SUCCESS",
            data: deletedTask,
        });
    }
    catch (error) {
        response.status(500).json({ message: "Error deleting task" });
        console.error(error);
    }
});
export default router;
//# sourceMappingURL=tasks.js.map