const auth = require('../auth')
const User = require('../models/user-model')
const bcrypt = require('bcryptjs')

getLoggedIn = async (req, res) => {
    auth.verify(req, res, async function () {
        try
        {
            const loggedInUser = await User.findOne({ _id: req.userId });
            return res.status(200).json({
                loggedIn: true,
                user: {
                    firstName: loggedInUser.firstName,
                    lastName: loggedInUser.lastName,
                    email: loggedInUser.email
                }
            }).send();
        } catch (err) {
            console.log("Error in auth.verify in user-controller.js (server)")
            // console.log(err);
        }
    })
}

registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, passwordVerify } = req.body;
        if (!firstName || !lastName || !email || !password || !passwordVerify) {
            return res
                .status(400)
                .json({ errorMessage: "Please enter all required fields." });
        }
        if (password.length < 8) {
            return res
                .status(400)
                .json({
                    errorMessage: "Please enter a password of at least 8 characters."
                });
        }
        if (password !== passwordVerify) {
            return res
                .status(400)
                .json({
                    errorMessage: "Please enter the same password twice."
                })
        }
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res
                .status(400)
                .json({
                    success: false,
                    errorMessage: "An account with this email address already exists."
                })
        }

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({
            firstName, lastName, email, passwordHash
        });
        const savedUser = await newUser.save();

        // LOGIN THE USER
        const token = auth.signToken(savedUser);

        await res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        }).status(200).json({
            success: true,
            user: {
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                email: savedUser.email
            }
        }).send();
    } catch (err) {
        console.error(err);
        // return res.status(500).send();
    }
}

loginUser = async (req, res) => {
    // LOGIN THE USER
    try
    {
        console.log("loginUser (server/user-controller)");
        // console.log(req.body);
        const {email, password} = req.body;
        
        const user = await User.findOne({email: email});
        // console.log(user);
        const passMatch = await bcrypt.compare(password, user.passwordHash);
        if (passMatch) {
            console.log("USER FOUND!")
            const token = auth.signToken(user);

            await res.cookie("token", token, {
                httpOnly: true,
                secure: true,
                sameSite: "none"
            }).status(200).json({
                success: true,
                user: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email
                }
            }).send();
        }

    } catch (err) {
        console.log("Invalid Username or Password. If you have an account, then please type in your password. Otherwise, create a new account.")
        // console.log(err);
    }
}

logoutUser = async (req, res) => {
    try
    {    
        res.clearCookie("token").status(200).json({success: true,
            user: {
            firstName: null,
            lastName: null,
            email: null
            }
        }).send();
        console.log("Cookies Cleared!");
    } catch (err) {
        console.log("logout promise");
    }
}

module.exports = {
    getLoggedIn,
    registerUser,
    loginUser,
    logoutUser
}