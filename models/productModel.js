const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
  },
  productImage: String,
  productStatePrice: Array,
  productImageUrl: String,
  productImages: Array,
  productImagesUrl: Array,
  productVideo: String,
  productCategories: Array,
  productBuyingPrice: Number,
  productSellingPrice: Number,
  productDescription: String,
  productBuyingUnit: String,
  productSellingUnit: String,
  productColor: String,
  productColorCode: String,
  productCountry: String,
  productState: String,
  type: String,
  ratingNumber: Number,
  ratingAverage: Number,
  reviewId: String,
  isPromo: Boolean,
  productDiscount: Number,
  productNewPrice: Number,
  promoType: {
    type: String,
    enum: ["Price", "Target", "Discount"],
  },

  totalSoldUnits: Number,
  totalSoldAmount: Number,
  totalPurchasedUnits: Number,
  totalPurchasedAmount: Number,
  productUnitPerPurchase: Number,
  availability: {
    type: String,
    default: "Exhausted",
    enum: ["Excellent", "Good", "Warning", "Danger", "Exhausted"],
  },

  remaining: {
    type: [Number],
    default: [0, 0],
  },

  dateCreated: Number,

  isAvailable: {
    type: Boolean,
    default: false,
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
