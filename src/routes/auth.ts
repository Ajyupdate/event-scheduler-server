// import nodemailer from 'nodemailer'
import { Router } from 'express';
import Users from '../models/users.js';
// import UsersVerification from '../models/userVerification';
import bcrypt from 'bcrypt'
const router = Router()
import { v4 as uuidv4 } from 'uuid'; 




// let transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth:{
//     user: "ajibadeemmanuel58@gmail.com",
//     pass: ""
//   }
// })

// transporter.verify((error, success) => {
//   if(error) {
//     console.log(error)
//   }else{
//     console.log("Ready for messages")
//   }
// })

router.post('/signin', (req, res) =>{
  let {email, password} = req.body;
  email = email.trim(); 
  password = password.trim();

  if(email == "" || password == ""){
    res.json({
      status: "FAILED",
      message: "Empty credentials supplied"
    })
  } else{
    Users.find({email})
      .then((data: { password: string }[]) => {
        if(data.length){
          const hashedPassword = data[0].password;
          bcrypt.compare(password, hashedPassword).then(result => {
            if(result){
              res.json({
                status: "SUCCESS",
                message: "Signin Successful",
                data:data
              })
            } else{
              res.json({
                status: "FAILED",
                message: "Invalid password",
                
              })
            }
          })
          .catch(err => {
            res.json({
              status: "FAILED",
              message: "An error occurred while comparing passwords",
              
            })
          })
        } else {
          res.json({
            status: "FAILED",
            message: "Invalid Credentials",
            
          })
        }
      })
      .catch(err => {
        res.json({
          status: "FAILED",
          message: "Invalid Credentials",
          
        })
      })
  }
})

router.post("/signup", (req, res) => {
  let {name, email, password} = req.body;
  name = name.trim();
  email = email.trim()
  password = password.trim()

  if(name == "" || email == "" || password == ""){
    res.json({
      status: "Failed",
      message: "Empty input fields!"
    })
  } else if (!/^[a-zA-Z ]*$/.test(name)){
    res.json({
      status:"Failed",
      message: "Invalid name entered"
    })
  } else if(!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)){
    res.json({
      status: "Failed",
      message: "Invalid email entered"
    })
  } else if(password.length < 8){
    res.json({
      status: "Failed",
      message: "Password is too short"
    })
  } else {
    Users.find({email}).then(result => {
      if(result.length){
        res.json({
          status: "Failed",
          message: "email already exist"
        })
      } else{

        const saltRounds = 10;
        bcrypt.hash(password, saltRounds).then(hashedPassword => {
          const newUser = new Users({
            name,
            email,
            password: hashedPassword,
          })

          
          newUser.save().then(result => {
            res.json({
              status: "SUCCESS",
              message: "New User added successfully",
              data: result,
            })
          })
          .catch(err => {
            res.json({
              status: "FAILED",
              message: "An error while saving user"
            })
          })
        })
        .catch(err => {
          res.json({
            status: "FAILED",
            message: "An error while hashing password"
          })
        })
        
      }
    }).catch(err => {
      console.log(err);
      res.json({
        status: "Failed",
        message: "An error occured"
      })
    })
  }
})

// Initialize Nodemailer with your email service credentials
// const transporter = nodemailer.createTransport({
//   service: 'Gmail', // E.g., 'Gmail', 'Outlook'
//   auth: {
//     user: 'ajibadeemmanuel58@gmail.com', // Your email address
//     pass: 'BnRFinch2001!',  // Your email password
//   },
// });

// Generate a random 6-digit token
function generateToken() {
  const min = 100000;
  const max = 999999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Define a POST route to send a 6-digit token to an email


// router.post('/sendMail', (req, res) => {
//   console.log(req.body)
//   const email = "marcusRichardson520@gmail.com"
 
//   if (!email) {
//     return res.status(400).json({ error: 'Email is required' });
//   }

//   // Generate a 6-digit token
//   const token = generateToken().toString();

//   // Compose the email message
//   const mailOptions = {
//     from: 'ajibadeemmanuel58@gmail.com',
//     to: email,
//     subject: 'Authentication Token',
//     text: `Your 6-digit token is: ${token}`,
//   };

//   // Send the email
//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'An error occurred while sending the email' });
//     } else {
//       console.log('Email sent: ' + info.response);
//       return res.status(200).json({ message: '6-digit token sent to your email' });
//     }
//   });
// });


export default router;