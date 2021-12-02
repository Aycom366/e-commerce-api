const CustomError = require("../errors");
const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const path = require("path");

const createProduct = async (req, res) => {
  //assign userId to the person
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};

const getAllProducts = async (req, res) => {
  const products = await Product.find({}).populate("reviews");
  res.status(StatusCodes.OK).json({ products });
};

const singleProduct = async (req, res) => {
  const products = await Product.findOne({ _id: req.params.id }).populate(
    "reviews"
  );
  if (!products) {
    throw new CustomError.NotFoundError("Product not found");
  }
  res.status(StatusCodes.OK).json({ products });
};

const updateProduct = async (req, res) => {
  const { id: ProductId } = req.params;
  const product = await Product.findOneAndUpdate({ _id: ProductId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    throw new CustomError.NotFoundError("Product not found");
  }
  res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req, res) => {
  const { id: ProductId } = req.params;
  const product = await Product.findOne({ _id: ProductId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    throw new CustomError.NotFoundError("Product not found");
  }
  await product.remove();
  res.status(StatusCodes.OK).json({ msg: "Product removed." });
};

const uploadImage = async (req, res) => {
  if (!req.files) {
    throw new CustomError.BadRequestError("No file uploaded");
  }
  const producImage = req.files.image;
  if (!producImage.mimetype.startsWith("image")) {
    throw new CustomError.BadRequestError("File must be an image");
  }

  const maxSize = 1024 * 1024;
  if (producImage.size > maxSize) {
    throw new CustomError.BadRequestError("File must be less than 1mb");
  }
  const imagePath = path.join(
    __dirname,
    "../public/uploads/" + producImage.name
  );
  await producImage.mv(imagePath);
  res.status(StatusCodes.OK).json({ image: `/uploads/${producImage.name}` });
};

module.exports = {
  createProduct,
  getAllProducts,
  singleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
