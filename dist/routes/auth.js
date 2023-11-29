import bcrypt from "bcrypt";
import { Router } from "express";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import otpGenerator from "otp-generator";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import UsersVerification from "../models/userVerification.js";
import Users from "../models/users.js";
const router = Router();
const currentUrl = "http://localhost:3001/";
router.get("/signin", (request, response) => {
    response.send("good jobbb");
});
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "richardsonmarcus520@gmail.com",
        pass: "wqih dtqk wyit lzwt",
    },
});
router.get("/sendmails", async (req, res, next) => {
    const option = {
        from: "richardsonmarcus520@gmail.com",
        to: "ajibadeemmanuel58@gmail.com",
        subject: "Verify Your Email",
        html: `<p>Verify your email address to complete the signup and
  and login into your account.</p><p>This link <b>expires
  in 6 hours </b>.</p><p>Press <a href=${currentUrl + "user/verify"}`,
    };
    transporter.sendMail(option, function (error, info) {
        if (error) {
            console.log(error, "error");
        }
        else {
            console.log("success", info);
        }
    });
});
export async function verifyUserToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).send({
            status: "Failed",
            message: "You are unauthorized to perform this operation. Log in to gain full access",
        });
    }
    try {
        const buyer = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.buyer = buyer;
        next();
    }
    catch (error) {
        return res.status(403).send({
            status: "Failed",
            message: "Your session has expired. Please log in again.",
        });
    }
}
router.post("/signin", (req, res) => {
    let { email, password } = req.body;
    email = email.trim();
    password = password.trim();
    if (email == "" || password == "") {
        res.json({
            status: "FAILED",
            message: "Empty credentials supplied",
        });
    }
    else {
        Users.find({ email })
            .then(async (data) => {
            if (data.length) {
                if (!data[0].verified) {
                    res.json({
                        status: "FAILED",
                        message: "Email hasn't been verified yet. Check your inbox",
                    });
                }
                else {
                    const hashedPassword = data[0].password;
                    bcrypt
                        .compare(password, hashedPassword)
                        .then((result) => {
                        if (result) {
                            const serializeUser = { name: email };
                            // Generate JWT token
                            const token = jwt.sign(serializeUser, process.env.ACCESS_TOKEN_SECRET, {
                                expiresIn: "5h",
                            });
                            res.json({
                                status: "SUCCESS",
                                message: "Sign in Successful",
                                token: token,
                                data: data[0],
                            });
                        }
                        else {
                            res.status(400);
                            res.json({
                                status: "FAILED",
                                message: "Invalid password",
                            });
                        }
                    })
                        .catch((err) => {
                        res.status(500);
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
            .catch((err) => {
            res.json({
                status: "FAILED",
                message: "Email doesn't exist",
            });
        });
    }
});
router.post("/signup", (req, res) => {
    let { name, email, password } = req.body;
    name = name.trim();
    email = email.trim();
    password = password.trim();
    if (name == "" || email == "" || password == "") {
        res.status(400);
        res.json({
            status: "Failed",
            message: "Empty input fields!",
        });
    }
    else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        res.status(400);
        res.json({
            status: "Failed",
            message: "Invalid email entered",
        });
    }
    else if (password.length < 8) {
        res.status(422);
        res.json({
            status: "Failed",
            message: "Password is too short",
        });
    }
    else if (Users.find({ name })) {
        res.status(409);
        res.json({
            status: "Failed",
            message: "Username already existed, choose another one",
        });
    }
    else {
        Users.find({ email })
            .then(async (result) => {
            if (result.length) {
                res.status(409);
                res.json({
                    status: "Failed",
                    message: "email already exist",
                });
            }
            else {
                const saltRounds = 10;
                await bcrypt
                    .hash(password, saltRounds)
                    .then((hashedPassword) => {
                    const newUser = new Users({
                        name,
                        email,
                        password: hashedPassword,
                        verified: false,
                    });
                    newUser
                        .save()
                        .then((result) => {
                        sendVerificationEmail(result, res);
                        // res.json({
                        //   status: "SUCCESS",
                        //   message: "New User added successfully",
                        //   data: result,
                        // })
                    })
                        .catch((err) => {
                        res.json({
                            status: "FAILED",
                            message: "An error while saving user",
                        });
                    });
                })
                    .catch((err) => {
                    res.json({
                        status: "FAILED",
                        message: "An error while hashing password",
                    });
                });
            }
        })
            .catch((err) => {
            res.json({
                status: "Failed",
                message: "An error occured",
            });
        });
    }
});
const sendVerificationEmail = ({ _id, email }, res) => {
    const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
    });
    const uniqueString = uuidv4() + _id;
    const option = {
        from: "richardsonmarcus520@gmail.com",
        to: email,
        subject: "Verify Your Email",
        html: `Your Verification code is ${otp}`,
    };
    const newVerification = new UsersVerification({
        userId: _id,
        uniqueString: otp,
        createdAt: Date.now(),
        expiresAt: Date.now() + 300000,
    });
    newVerification
        .save()
        .then((response) => {
        transporter
            .sendMail(option)
            .then(() => {
            res.json({
                status: "Pending",
                message: "Verification email sent",
                data: response,
            });
        })
            .catch((error) => {
            res.status(404);
            res.json({
                status: "Failed",
                message: "Verification email failed",
            });
        });
    })
        .catch((error) => {
        res.status(500);
        res.json({
            status: "Failed",
            message: "Couldn't save verificaton mail",
        });
    });
    // hash the uniqueString
    // const saltRounds = 10;
    // bcrypt
    //   .hash(uniqueString, saltRounds)
    //   .then(hashedUniqueString =>{
    //     const newVerification = new UsersVerification({
    //       userId: _id,
    //       uniqueString: hashedUniqueString,
    //       createdAt: Date.now(),
    //       expiresAt: Date.now() + 21000
    //     })
    //     newVerification
    //       .save()
    //       .then(() => {
    //         transporter
    //           .sendMail(option)
    //           .then(() => {
    //             res.json(
    //               {
    //               status: "Pending",
    //               message: "Verification email sent"
    //             })
    //           })
    //           .catch((error) => {
    //             console.log(error)
    //             res.json({
    //               status: "Failed",
    //               message: "Verification email failed"
    //             })
    //           })
    //       }
    //       )
    //       .catch((error) => {
    //         res.json({
    //           status: "Failed",
    //           message: "Couldn't save verification email"
    //         })
    //       })
    //   })
    //   .catch(err => {
    //     console.log(err);
    //     res.json({
    //       status: "Failed",
    //       message: "An error occured while hashing email"
    //     })
    //   })
};
router.post("/verify-otp", (req, res) => {
    let { userId, uniqueString } = req.body;
    userId = userId.trim();
    uniqueString = uniqueString.trim();
    UsersVerification.find({ userId, uniqueString })
        .then((result) => {
        if (result.length > 0) {
            const { expiresAt } = result[0];
            if (expiresAt.getTime() < Date.now()) {
                UsersVerification.deleteOne({ userId })
                    .then((result) => {
                    Users.deleteMany({ id: userId, verified: false })
                        .then(() => {
                        res.status(403);
                        res.send({
                            status: "Failed",
                            message: "OTP expired",
                        });
                    })
                        .catch((error) => {
                        res.status(500);
                        res.send({
                            status: "Failed",
                            messae: "error encountered",
                        });
                    });
                })
                    .catch((error) => {
                    res.status(500);
                    res.send({
                        status: "Failed",
                        message: "error when trying to delete verification",
                    });
                });
            }
            else {
                Users.updateOne({ _id: userId }, { verified: true })
                    .then(() => {
                    res.send({
                        status: "Success",
                        message: "Verification Completed",
                    });
                })
                    .catch((error) => {
                    res.send({
                        status: "Failed",
                        message: "unable to verify status",
                    });
                });
            }
        }
        else {
            res.status(404);
            res.send({
                status: "Failed",
                message: "Invalid registration email",
            });
        }
    })
        .catch((error) => {
        res.status(500);
        res.send({
            status: "Failed",
            message: "error getting verification",
        });
    });
});
router.get("/verify/:userId/:uniqueString", (req, res) => {
    let { userId, uniqueString } = req.params;
    UsersVerification.find({ userId })
        .then((result) => {
        if (result.length > 0) {
            const { expiresAt } = result[0];
            const hashedUniqueString = result[0].uniqueString;
            //checking for expired unique string
            if (expiresAt.getTime() < Date.now()) {
                UsersVerification.deleteOne({ userId })
                    .then((result) => {
                    Users.deleteOne({ id: userId })
                        .then(() => {
                        let message = "Link has expired, please sign up again";
                        res.redirect(`/user/verified/error=true&message=${message}`);
                    })
                        .catch((error) => {
                        let message = "Clearing user with expired unique string failed";
                        res.redirect(`/user/verified/error=true&message=${message}`);
                    });
                })
                    .catch((error) => {
                    let message = "An error occured while checking for existing user verification record";
                    res.redirect(`/user/verified/error=true&message=${message}`);
                });
            }
            else {
                //valid record exist so we validate the user string
                //first compare the hashed unique string
                bcrypt
                    .compare(uniqueString, hashedUniqueString)
                    .then((result) => {
                    if (result) {
                        //string match
                        Users.updateOne({ _id: userId }, { verified: true })
                            .then(() => {
                            UsersVerification.deleteOne({ userId })
                                .then(() => {
                                res.sendFile(path.join(__dirname, "./../views/verified.html"));
                            })
                                .catch((error) => {
                                let message = "An error occured while finalizing successfull verification";
                                res.redirect(`/user/verified/error=true&message=${message}`);
                            });
                        })
                            .catch((error) => {
                            let message = "An error occured while updating user record to show verified";
                            res.redirect(`/user/verified/error=true&message=${message}`);
                        });
                    }
                    else {
                        let message = "Invalid verification passed. Check your inbox";
                        res.redirect(`/user/verified/error=true&message=${message}`);
                    }
                })
                    .catch((error) => {
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
        let message = "An error occured while checking for existing user verification record";
        res.redirect(`/user/verified/error=true&message=${message}`);
    });
});
//Verified page route
router.get("/verified", (req, res) => {
    res.sendFile(path.join(__dirname, "./../views/verified.html"));
});
export default router;
//# sourceMappingURL=auth.js.map