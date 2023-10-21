const express = require("express");
const router = express.Router()
const jwt = require("jsonwebtoken");
const User = require("../models/user.model")
const auth = require("../middlewares/jwt")
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

router.get("/ping", async (req, res, next) => {
  res.status(200).json("Hello");
});

router.get("/", async (req, res, next) => {
  res.status(200).json("Hello");
});

router.post("/login", async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      if (user.validPassword(req.body.password)) {
        const token = jwt.sign({ email: user.email, _id: user._id }, process.env.SECRET, { expiresIn: "12h" });
        res.status(200).json({ message: "Auth successful", token: token, uid: user._id });
      } else {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect password');
      }
    } else {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email');
    }
  } catch (e) {
    next(e);
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const {name,email,password,role}=req.body;
    if(!email || !password || !name){
      throw new ApiError(httpStatus.BAD_REQUEST, 'Please provide name, email and password');
    }
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'User with provided email is already present');
    }
    user = new User();
    user.name = name;
    user.email = email;
    user.password = user.encryptPassword(password);
    user.role = role || "user";
    await user.save();
    res.status(201).json("Newuser is successully created");
  } catch (e) {
    next(e);
  }
});

router.get("/user", auth.checkToken, async (req, res, next) => {
  try {
    const users = await User.find();
    if (users) {
      return res.status(200).json(users);
    }
  } catch (e) {
    next(e);
  }
});

router.put("/user/:id", auth.checkToken, async (req, res, next) => {
  try {
    let {email,password,name}=req.body;
    if(!email || !password || !name){
      throw new ApiError(httpStatus.BAD_REQUEST, 'Please provide name, email and password');
    }
    let user=await User.findById(req.params.id);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    user.password = user.encryptPassword(password);
    user.email = email;
    await user.save();
    res.status(200).json("User is successully updated");
  } catch (e) {
    next(e);
  }
});

router.delete("/user/:id", auth.checkToken, async (req, res, next) => {
  try {
    const user=await User.findByIdAndDelete(req.params.id);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    res.status(200).json("User is successully deleted");
  } catch (e) {
    next(e);
  }
});

module.exports = router