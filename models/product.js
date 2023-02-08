const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
});

module.exports = mongoose.model("Product", productSchema);
// const mongo = require("mongo");
// const ObjectId = mongo.ObjectId;
// export class Product {
//   constructor(id, name, price, description) {
//     this.id = id ? new mongo.ObjectId(id) : null;
//     this.name = name;
//     this.price = price;
//     this.description = description;
//   }

//   save() {}

//   static findOne(id) {}

//   static deleteOne(id) {}
// }
