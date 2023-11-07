import mongoose, { Schema, Document } from 'mongoose';

// Define an interface to represent the data structure
interface ITaskData extends Document {
    title: string
    startTime: string,
    endTime: string,
    date:  string,
    completed: boolean,
    owner: string
}

// Define a Mongoose schema
const dataSchema = new Schema<ITaskData>({
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
const Tasks = mongoose.model<ITaskData>('tasks', dataSchema);

// Export the model for use in your application
export default Tasks;
