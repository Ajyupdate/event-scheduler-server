import mongoose, { Schema } from 'mongoose';
// Define a Mongoose schema
const dataSchema = new Schema({
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
    verified: {
        type: Boolean,
        required: true,
    },
});
// Create a Mongoose model based on the schema
const Users = mongoose.model('users', dataSchema);
// Export the model for use in your application
export default Users;
//# sourceMappingURL=users.js.map