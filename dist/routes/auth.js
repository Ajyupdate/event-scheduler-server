import bcrypt from 'bcrypt';
import { Router } from 'express';
import nodemailer from 'nodemailer';
import otpGenerator from 'otp-generator';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import UsersVerification from '../models/userVerification.js';
import Users from '../models/users.js';
const router = Router();
const currentUrl = "http://localhost:3001/";
router.get("/signin", (request, response) => {
    response.send("good job");
});
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "richardsonmarcus520@gmail.com",
        pass: "wqih dtqk wyit lzwt"
    }
});
router.get('/sendmails', async (req, res, next) => {
    const option = {
        from: "richardsonmarcus520@gmail.com",
        to: "ajibadeemmanuel58@gmail.com",
        subject: "Verify Your Email",
        html: `<p>Verify your email address to complete the signup and
  and login into your account.</p><p>This link <b>expires
  in 6 hours </b>.</p><p>Press <a href=${currentUrl + "user/verify"}`
    };
    transporter.sendMail(option, function (error, info) {
        if (error) {
            console.log(error, 'error');
        }
        else {
            console.log('success', info);
        }
    });
});
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
router.post('/signin', (req, res) => {
    let { email, password } = req.body;
    email = email.trim();
    password = password.trim();
    if (email == "" || password == "") {
        res.json({
            status: "FAILED",
            message: "Empty credentials supplied"
        });
    }
    else {
        Users.find({ email })
            .then((data) => {
            if (data.length) {
                if (!data[0].verified) {
                    res.json({
                        status: "FAILED",
                        message: "Email hasn't been verified yet. Check your inbox"
                    });
                }
                else {
                    const hashedPassword = data[0].password;
                    bcrypt.compare(password, hashedPassword)
                        .then(result => {
                        if (result) {
                            res.json({
                                status: "SUCCESS",
                                message: "Signin Successful",
                                data: data
                            });
                        }
                        else {
                            res.json({
                                status: "FAILED",
                                message: "Invalid password",
                            });
                        }
                    })
                        .catch(err => {
                        res.json({
                            status: "FAILED",
                            message: "An error occurred while comparing passwords",
                        });
                    });
                }
            }
            else {
                res.json({
                    status: "FAILED",
                    message: "Invalid Credentials",
                });
            }
        })
            .catch(err => {
            res.json({
                status: "FAILED",
                message: "Invalid Credentials",
            });
        });
    }
});
router.post("/signup", (req, res) => {
    console.log(otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false }));
    let { name, email, password } = req.body;
    name = name.trim();
    email = email.trim();
    password = password.trim();
    if (name == "" || email == "" || password == "") {
        res.json({
            status: "Failed",
            message: "Empty input fields!"
        });
    }
    else if (!/^[a-zA-Z ]*$/.test(name)) {
        res.json({
            status: "Failed",
            message: "Invalid name entered"
        });
    }
    else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        res.json({
            status: "Failed",
            message: "Invalid email entered"
        });
    }
    else if (password.length < 8) {
        res.json({
            status: "Failed",
            message: "Password is too short"
        });
    }
    else {
        Users.find({ email }).then(result => {
            if (result.length) {
                res.json({
                    status: "Failed",
                    message: "email already exist"
                });
            }
            else {
                const saltRounds = 10;
                bcrypt.hash(password, saltRounds).then(hashedPassword => {
                    const newUser = new Users({
                        name,
                        email,
                        password: hashedPassword,
                        verified: false
                    });
                    newUser.save().then(result => {
                        sendVerificationEmail(result, res);
                        // res.json({
                        //   status: "SUCCESS",
                        //   message: "New User added successfully",
                        //   data: result,
                        // })
                    })
                        .catch(err => {
                        res.json({
                            status: "FAILED",
                            message: "An error while saving user"
                        });
                    });
                })
                    .catch(err => {
                    res.json({
                        status: "FAILED",
                        message: "An error while hashing password"
                    });
                });
            }
        }).catch(err => {
            console.log(err);
            res.json({
                status: "Failed",
                message: "An error occured"
            });
        });
    }
});
const sendVerificationEmail = ({ _id, email }, res) => {
    const uniqueString = uuidv4() + _id;
    const option = {
        from: "richardsonmarcus520@gmail.com",
        to: email,
        subject: "Verify Your Email",
        html: `<p>Verify your email address to complete the signup and
    and login into your account.</p><p>This link <b>expires
    in 6 hours </b>.</p><p>Press <a href=${currentUrl + "user/verify/" + _id + "/" + uniqueString}>here</a> to proceed. </p>`,
    };
    // hash the uniqueString
    const saltRounds = 10;
    bcrypt
        .hash(uniqueString, saltRounds)
        .then(hashedUniqueString => {
        const newVerification = new UsersVerification({
            userId: _id,
            uniqueString: hashedUniqueString,
            createdAt: Date.now(),
            expiresAt: Date.now() + 21000
        });
        newVerification
            .save()
            .then(() => {
            transporter
                .sendMail(option)
                .then(() => {
                res.json({
                    status: "Pending",
                    message: "Verification email sent"
                });
            })
                .catch((error) => {
                console.log(error);
                res.json({
                    status: "Failed",
                    message: "Verification email failed"
                });
            });
        })
            .catch((error) => {
            res.json({
                status: "Failed",
                message: "Couldn't save verification email"
            });
        });
    })
        .catch(err => {
        console.log(err);
        res.json({
            status: "Failed",
            message: "An error occured while hashing email"
        });
    });
};
router.get("/verify/:userId/:uniqueString", (req, res) => {
    let { userId, uniqueString } = req.params;
    UsersVerification
        .find({ userId })
        .then((result) => {
        if (result.length > 0) {
            const { expiresAt } = result[0];
            const hashedUniqueString = result[0].uniqueString;
            //checking for expired unique string
            if (expiresAt.getTime() < Date.now()) {
                UsersVerification
                    .deleteOne({ userId })
                    .then(result => {
                    Users
                        .deleteOne({ id: userId })
                        .then(() => {
                        let message = "Link has expired, please sign up again";
                        res.redirect(`/user/verified/error=true&message=${message}`);
                    })
                        .catch(error => {
                        let message = "Clearing user with expired unique string failed";
                        res.redirect(`/user/verified/error=true&message=${message}`);
                    });
                })
                    .catch((error) => {
                    console.log(error);
                    let message = "An error occured while checking for existing user verification record";
                    res.redirect(`/user/verified/error=true&message=${message}`);
                });
            }
            else {
                //valid record exist so we validate the user string
                //first compare the hashed unique string
                bcrypt
                    .compare(uniqueString, hashedUniqueString)
                    .then(result => {
                    if (result) {
                        //string match
                        Users
                            .updateOne({ _id: userId }, { verified: true })
                            .then(() => {
                            UsersVerification
                                .deleteOne({ userId })
                                .then(() => {
                                res.sendFile(path.join(__dirname, "./../views/verified.html"));
                            })
                                .catch(error => {
                                console.log(error);
                                let message = "An error occured while finalizing successfull verification";
                                res.redirect(`/user/verified/error=true&message=${message}`);
                            });
                        })
                            .catch(error => {
                            console.log(error);
                            let message = "An error occured while updating user record to show verified";
                            res.redirect(`/user/verified/error=true&message=${message}`);
                        });
                    }
                    else {
                        let message = "Invalid verification passed. Check your inbox";
                        res.redirect(`/user/verified/error=true&message=${message}`);
                    }
                })
                    .catch(error => {
                    let message = "An error occured while comparing unique string";
                    res.redirect(`/user/verified/error=true&message=${message}`);
                });
            }
        }
        else {
            //user verification record doesn't exist
            let message = "An error occured while checking for existing user verification record";
            res.redirect(`/user/verified/error=true&message=${message}`);
        }
    })
        .catch((error) => {
        console.log(error);
        let message = "An error occured while checking for existing user verification record";
        res.redirect(`/user/verified/error=true&message=${message}`);
    });
});
//Verified page route
router.get("/verified", (req, res) => {
    res.sendFile(path.join(__dirname, "./../views/verified.html"));
});
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
//# sourceMappingURL=auth.js.map