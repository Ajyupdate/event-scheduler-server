import mongoose, { Schema, Document } from 'mongoose';

// Define an interface to represent the data structure
interface IUserData extends Document {
  name: string;
  email: string;
  password: string;
  verified: boolean,
  taskId: string
}

// Define a Mongoose schema
const dataSchema = new Schema<IUserData>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  // verified: {
  //   type: Boolean,
  //   required: true,
  // },
  
});

// Create a Mongoose model based on the schema
const Users = mongoose.model<IUserData>('users', dataSchema);

// Export the model for use in your application
export default Users;
