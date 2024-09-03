import mongoose from "mongoose";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const User = mongoose.Schema;
const UserSchema = new User({
    firstName: { type: String, required: [true, "First name is required"] },
    lastName: { type: String, required: [true, "Last name is required"] },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    tokens: [
        {
            token: { required: true, type: String },
        },
    ],
});

UserSchema.set("toJSON", {
    virtuals: true,
    transform: function (doc, ret, options) {
        const { firstName, lastName, email } = ret;

        return { firstName, lastName, email }; // return fields we need
    },
});

UserSchema.pre("save", async function (next) {
    try {
        if (this.isModified("password")) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }
        next();
    } catch (error) {
        next(error);
    }
});

UserSchema.statics.findByCredentials = async (email, password) => {
    const user = await UserModel.findOne({ email });
    if (!user)
        throw new CustomError(
            "Wrong credentials!",
            400,
            "Email or password is wrong!"
        );
    const passwdMatch = await bcrypt.compare(password, user.password);
    if (!passwdMatch)
        throw new CustomError(
            "Wrong credentials!!",
            400,
            "Email or password is wrong!"
        );
    return user;
};


UserSchema.methods.generateAccessToken = function () {
    const user = this;

    // Create signed access token using environment variables
    const accessToken = jwt.sign(
        {
            _id: user._id.toString(),
            fullName: `${user.firstName} ${user.lastName}`,
            email: user.email,
        },
        process.env.AUTH_ACCESS_TOKEN_SECRET, // Use environment variable for secret
        {
            expiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRY, // Use environment variable for expiry
        }
    );

    return accessToken;
};

UserSchema.methods.generateRefreshToken = async function () {
    const user = this;

    // Create signed refresh token using environment variables
    const refreshToken = jwt.sign(
        {
            _id: user._id.toString(),
        },
        process.env.AUTH_REFRESH_TOKEN_SECRET, // Use environment variable for secret
        {
            expiresIn: process.env.AUTH_REFRESH_TOKEN_EXPIRY, // Use environment variable for expiry
        }
    );

   
    const rTknHash = crypto
        .createHmac("sha256", process.env.AUTH_REFRESH_TOKEN_SECRET) // Use environment variable for secret
        .update(refreshToken)
        .digest("hex");

    // Save 'refresh token hash' to database
    user.tokens.push({ token: rTknHash });
    await user.save();

    return refreshToken;
};

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;
