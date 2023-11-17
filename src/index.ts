import cors from 'cors';
import express from 'express';

import { connectToDatabase } from "./connection/db.js";
import Users from './models/users.js';
import UserRoute from './routes/auth.js';
import Tasks from './routes/tasks.js';
const app = express()

const corsOptions = {
  origin: "*",
};
app.use(cors(corsOptions));
const port =  3001;
app.use(express.json()); 
// app.use(cors({ origin: 'http://localhost:3000' }));
app.use(cors())


app.use('/auth', UserRoute)
app.use('/tasks', Tasks)
app.get('/', (req, res) => {
  
    res.send('Hello, Express with TypeScriptttt and MongoDB!');
  });

app.get('/reviews', async(req, res) =>{
try{
    const reviews = await Users.find()

    res.json(reviews)
}
catch(error){
    res.status(500).json({ error: 'An error occurred while fetching data' });
}
})

connectToDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log("app listening on port 3001");
    });
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });