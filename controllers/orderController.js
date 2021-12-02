const CustomError = require("../errors");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { StatusCodes } = require("http-status-codes");
const { checkPermission } = require("../utils");

const fakeStripeApi = async ({ amount, currency }) => {
  const clientSecret = "someRandomValue";
  return { clientSecret, amount };
};

const createOrder = async (req, res) => {
  //get cartitems coming
  const { items: cartItems, tax, shippingFee } = req.body;

  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError("No items in cart");
  }

  if (!tax || !shippingFee) {
    throw new CustomError.BadRequestError("tax and shipping fee required");
  }

  //check if product is available
  //for of loop makes us use await in a loop
  let orderItems = [];
  let subtotal = 0;
  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product });
    if (!dbProduct) {
      throw new CustomError.NotFoundError(
        `No product with id : ${item.product}`
      );
    }
    //get those products that are available
    const { name, price, image, _id } = dbProduct;

    //constructing object for the singleobject schemea
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };

    //add item to orderItem array
    orderItems = [...orderItems, singleOrderItem];

    //calulcate subtotal, amount used here is quantity
    subtotal += item.amount * price;
  }

  //cal total
  const total = tax + shippingFee + subtotal;

  //working with stripe to get client scecret key
  const paymentIntent = await fakeStripeApi({
    amount: total,
    currency: "usd",
  });

  //creating the order
  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.clientSecret,
    user: req.user.userId,
  });

  res.status(StatusCodes.CREATED).json({
    order,
    clientSecret: order.clientSecret,
  });
};

const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
  }
  checkPermission(req.user, order.user);
  res.status(StatusCodes.OK).json(order);
};

//all orders associated with a user
const getCurrentUserOrder = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId });
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const updateOrder = async (req, res) => {
  const { id: orderId } = req.params;

  //after oayment is succesful
  const { paymentIntentId } = req.body;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
  }
  checkPermission(req.user, order.user);

  order.paymentIntentId = paymentIntentId;
  order.status = "paid";
  await order.save();

  res.status(StatusCodes.OK).json({ msg: "order updated" });
};

const deleteOrder = async (req, res) => {
  res.send("delete order");
};

module.exports = {
  createOrder,
  getSingleOrder,
  getCurrentUserOrder,
  getAllOrders,
  updateOrder,
  deleteOrder,
};
