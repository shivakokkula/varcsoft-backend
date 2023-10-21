const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

var Schema = mongoose.Schema;
var draftSchema = new Schema({
  title: { type: String, required: true, trim: true, unique: true },
  category: { type: String, required: true },
  design_data: { type: String, required: true },
  elements: [ { type: String, url: String } ],
  created_by: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true },
},{
  timestamps: true,
});
module.exports = mongoose.model("Draft", draftSchema);
