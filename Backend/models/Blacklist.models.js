

const mongoose = require("mongoose");

const TokenSchema = mongoose.Schema({
  
  token: String,
  createdAt: { type: Date, expires: '7d', default: Date.now }
})

const BlacklistTokenModel = mongoose.model("BlacklistToken", TokenSchema)

module.exports = {
  BlacklistTokenModel
}
