import { PORT, MONGODBURL } from "./config.js";
import express from "express";
import mongoose from "mongoose";

import "dotenv/config";
import dotenv from "dotenv";
import { format } from "date-fns";

import User from "./models/Users.js";
import UserModel from "./models/Users.js";
dotenv.config();

const app = express();
const serverMsg = "server is running";

const ACCESS_TOKEN = {
    cookie: {
        name: "accessToken",
    },
    secret: process.env.AUTH_ACCESS_TOKEN_SECRET,
    expiry: process.env.AUTH_ACCESS_TOKEN_EXPIRY,
};
const REFRESH_TOKEN = {
    cookie: {
        name: "refreshToken",
    },
    secret: process.env.AUTH_REFRESH_TOKEN_SECRET,
    expiry: process.env.AUTH_REFRESH_TOKEN_EXPIRY,
};

mongoose
    .connect(MONGODBURL)
    .then(() => {
        console.log("connected to database");
        app.listen(PORT, () => {
            console.log(serverMsg, PORT);
        });
    })
    .catch((error) => {
        console.log(error);
    });

app.use(express.json());

// root route
app.get("/", (req, res, next) => {
    const responseData = {
        message: serverMsg,
        data: null,
    };
    return res.status(200).json(responseData);
});
// app.post("",()=>{
//     const User= mongoose.model("")
// })

// register of user
app.post("/register", async (req, res, next) => {
    // console.log(req.body);
    // return;
    let response = "";
    try {
        response = await User.create(req.body);
        console.log(response);
    } catch (error) {
        console.log("error", error);
        return res.status(400).json({ message: "Bad Request", data: null });
    }
    return res.status(201).json({
        message: "New User Created Successfully",
        data: response.email,
    });
});

// user login
app.post("/login", async (req, res, next) => {
    const { email, password } = req.body;

    const user = await UserModel.findByCredentials(email, password);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    res.cookie(
        REFRESH_TOKEN.cookie.name,
        refreshToken,
        REFRESH_TOKEN.cookie.options
    );

    // Send Response on successful Login
    res.json({
        success: true,
        user,
        accessToken,
    });
});

app.put("/update", async (req, res, next) => {
    try {
        const updatedData = await User.findOneAndUpdate(
            { firstname: "ram" },
            { firstname: "hari" },
            { new: true }
        );
        if (!updatedData) {
            return res.status(404).json({ error: "user not found" });
        }
        return res.status(200).json({ updatedData: updatedData.firstname });
    } catch (error) {
        console.log(error);
    }
});

// find all users
app.get("/findall", async (req, res, next) => {
    let allUsers;

    try {
        allUsers = await User.find();
        console.log(allUsers);
    } catch (error) {
        console.log(error);
    }

    return res.status(200).json({
        message: "All Users",
        data: allUsers,
    });
});

app.get("/findone", async (req, res, next) => {
    let oneUser;

    try {
        oneUser = await User.findOne({ _id: "66b960ecae9bcbc0c9c8845d   " });
    } catch (error) {
        console.log(error);
    }

    return res.status(200).json({
        message: "one User",
        data: oneUser,
    });
});

// app.get("/login", (req, res, next) => {
//     const responseData = {
//         message: "login",
//         data: null,
//     };
//     return res.status(200).json(responseData);
// });
