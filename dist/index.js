import { connectToDatabase } from "./connection/db.js";
import express from 'express';
const app = express();
const port = 3001;
app.use(express.json());
app.get('/', (req, res) => {
    res.send('Hello, Express with TypeScriptttt and MongoDB!');
});
connectToDatabase()
    .then(() => {
    app.listen(port, () => {
        console.log("app listening on port 3001");
    });
})
    .catch((err) => {
    console.error("Error connecting to the database:", err);
});
//# sourceMappingURL=index.js.map