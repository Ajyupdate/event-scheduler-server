import mongoose from 'mongoose';
export const connectToDatabase = async () => {
    try {
        await mongoose
            .connect("mongodb+srv://Ajy14:emmanuel2001@cluster0.imd9dxq.mongodb.net/schedule?retryWrites=true&w=majority", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: true,
        });
        console.log('Database Connected Successfully.');
    }
    catch (error) {
        console.error('Error Connecting to the Database:', error);
        throw error; // Rethrow the error for handling in your application
    }
};
//# sourceMappingURL=db.js.map