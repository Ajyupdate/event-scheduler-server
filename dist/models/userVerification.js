import mongoose, { Schema } from 'mongoose';
// Define a Mongoose schema
const dataSchema = new Schema({
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
const UsersVerification = mongoose.model('UsersVerification', dataSchema);
// Export the model for use in your application
export default UsersVerification;
//# sourceMappingURL=userVerification.js.map