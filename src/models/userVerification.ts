import mongoose, { Schema, Document } from 'mongoose';

// Define an interface to represent the data structure
interface IUserData extends Document {
  userId: string;
  uniqueString: string;
  createdAt: Date;
  expiresAt: Date
}

// Define a Mongoose schema
const dataSchema = new Schema<IUserData>({
  userId: {
    type: String,
    required: true,
  },
  uniqueString: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

// Create a Mongoose model based on the schema
const UsersVerification = mongoose.model<IUserData>('UsersVerification', dataSchema);

// Export the model for use in your application
export default UsersVerification;
