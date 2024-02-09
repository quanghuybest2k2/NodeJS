const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

(async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/mydatabase", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
})();

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

const Schema = mongoose.Schema;
const userSchema = new Schema({
  name: String,
  email: String,
});

const User = mongoose.model("User", userSchema);

// CREATE
app.post("/users", async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    return res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to create user", error: error.message });
  }
});

// READ
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    return res
      .status(200)
      .json({ message: "Users fetched successfully", users });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
});

// UPDATE
app.put("/users/:userId", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      req.body,
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    return res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update user", error: error.message });
  }
});

// DELETE
app.delete("/users/:userId", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
