const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  email: { type: String, required: true },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  const index = this.cart.items.findIndex((item) => {
    // console.log(1);
    return item.productId.toString() === product._id.toString();
  });

  // let newQuantity = 1;
  // updatedCartItems = [...this.cart.items];

  if (index >= 0) {
    // newQuantity = this.cart.items[index].quantity + 1;
    // updatedCartItems[index].quantity += newQuantity;
    this.cart.items[index].quantity += 1;
  } else {
    // updatedCartItems.push({
    //   productId: product._id,
    //   quantity: newQuantity,
    // });
    this.cart.items.push({
      productId: product._id,
      quantity: 1,
    });
  }

  // const updatedCart = { items: updatedCartItems };
  // this.cart = updatedCart;
  return this.save();
};

userSchema.methods.deleteCartItem = function (product) {
  const updatedItems = this.cart.items.filter(
    (item) => item.productId.toString() !== product._id.toString()
  );
  this.cart.items = updatedItems;
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};
module.exports = mongoose.model("User", userSchema);
