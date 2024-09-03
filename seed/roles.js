import mongoose from "mongoose";
import { PORT, MONGODBURL } from "../config.js";

import Role from "../models/Roles.js";
import { roles } from "../data/roles.js";

mongoose
    .connect(MONGODBURL)
    .then(async () => {
        console.log("connected to database");

        await Role.deleteMany({});
        console.log("Roles cleared");

        try {
            // Create an array of promises for role creation
            const rolePromises = roles.map((role) =>
                Role.create({ id: role.id, name: role.name })
            );

            // Wait for all role creation promises to resolve
            await Promise.all(rolePromises);

            console.log("Roles Seeded");
        } catch (error) {
            console.error("Error seeding database:", error);
        } finally {
            // Close the mongoose connection
            mongoose.connection.close();
            console.log("Mongoose connection closed.");
        }
    })
    .catch((error) => {
        console.log(error);
    });
