const mongoose = require("mongoose");

const ReviewSchema = mongoose.Schema(
  {
    rating: {
      type: Number,
      required: [true, "Please provide rating"],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      required: [true, "Please provide price"],
      maxlength: 100,
    },
    comment: {
      type: String,
      required: [true, "Please provide review text"],
    },

    product: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

//compound index, one review per product per user
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

//this is statics since we are calling it in this shema and not method
ReviewSchema.statics.calcAverageRating = async function (productId) {
  const result = await this.aggregate([
    {
      $match: {
        product: new ObjectId(productId),
      },
    },
    {
      $group: {
        _id: null,
        averageRating: {
          $avg: "$rating",
        },
        numOfReviews: {
          $sum: 1,
        },
      },
    },
  ]);
  //after getting result, then update product
  //but check if the result is not empty, that is nothing is inside the review
  try {
    await this.model("Product").findByIdAndUpdate(productId, {
      averageRating: Math.ceil(result[0]?.averageRating || 0),
      numOfReviews: result[0]?.numOfReviews || 0,
    });
  } catch (error) {}
};

//when actually posting to database
ReviewSchema.post("save", async function () {
  await this.constructor.calcAverageRating(
    //this .product below is the product model created above
    this.product
  );
});

ReviewSchema.post("remove", async function () {
  await this.constructor.calcAverageRating(
    //this .product below is the product model created above
    this.product
  );
});

module.exports = mongoose.model("Review", ReviewSchema);
