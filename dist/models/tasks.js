import mongoose, { Schema } from 'mongoose';
// Define a Mongoose schema
const dataSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    startTime: {
        type: String,
        required: true,
    },
    endTime: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    owner: {
        type: String,
        required: true,
    },
    completed: {
        type: Boolean,
        required: true,
    },
});
// Create a Mongoose model based on the schema
const Tasks = mongoose.model('tasks', dataSchema);
// Export the model for use in your application
export default Tasks;
//# sourceMappingURL=tasks.js.map