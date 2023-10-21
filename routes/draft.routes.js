const express = require("express");
const router = express.Router()
const jwt = require("jsonwebtoken");
const User = require("../models/user.model")
const Draft = require("../models/draft.model")
const auth = require("../middlewares/jwt")
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

router.post("/", auth.checkToken, async (req, res, next) => {
  try {
    const {title,category,design_data,elements}=req.body;
    const user = req.user;
    if(!title || !category || !design_data){
      throw new ApiError(httpStatus.BAD_REQUEST, 'Please provide title, category and design_data');
    }
    let draft = await Draft.findOne({ title: title });
    if (draft) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Draft with provided title is already present');
    }
    draft = new Draft();
    draft.title = title;
    draft.category = category;
    draft.design_data = design_data;
    draft.elements = elements;
    draft.created_by = user._id;
    await draft.save();
    res.status(201).json(`Draft ${title} is successully created`);
  } catch (e) {
    next(e);
  }
});

router.get("/", auth.checkToken, async (req, res, next) => {
  try {
    const user = req.user;
    const drafts = await Draft.find({created_by:user._id});
    if (drafts) {
      return res.status(200).json(drafts);
    }
  } catch (e) {
    next(e);
  }
});

router.get("/:id", auth.checkToken, async (req, res, next) => {
  try {
    const draft = await Draft.findById(req.params.id);
    if (draft) {
      return res.status(200).json(draft);
    }
  } catch (e) {
    next(e);
  }
});

router.put("/:id", auth.checkToken, async (req, res, next) => {
  try {
    const {title,category,design_data,elements}=req.body;
    const user = req.user;
    if(!title || !category || !design_data || elements){
      throw new ApiError(httpStatus.BAD_REQUEST, 'Please provide title, category and design_data');
    }
    const draft = await Draft.findById(req.params.id);
    if (!draft) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Draft not found');
    }
    draft.title = title;
    draft.category = category;
    draft.design_data = design_data;
    draft.elements = elements;
    await draft.save();
    res.status(201).json(`Draft ${title} is successully updated`);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", auth.checkToken, async (req, res, next) => {
  try {
    const draft = await Draft.findByIdAndDelete(req.params.id);
    if (!draft) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Draft not found');
    }
    res.status(200).json("Draft is successully deleted");
  } catch (e) {
    next(e);
  }
});

module.exports = router