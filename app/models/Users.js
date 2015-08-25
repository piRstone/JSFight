var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  username: { type: String, index: { unique: true }},
  password: String,
  win: Number,
  loses: Number,
  games: Number,
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);