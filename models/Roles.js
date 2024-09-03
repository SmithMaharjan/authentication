import mongoose from "mongoose";

const Role = mongoose.model("Role", {
    id: Number,
    name: String,
});

export default Role;
