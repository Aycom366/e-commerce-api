require("dotenv").config();

//the express async middleware errors
require("express-async-errors");

//express server
const express = require("express");
const app = express();

//rest of the packages
//mainly for debugging, checking the routes your hitting
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const fileUpload = require("express-fileupload");

//database connection
const connectDb = require("./db/connect");

//importing middlewares
const authRouter = require("./routes/authRouter");
const userRoutes = require("./routes/userRoute");
const productRoutes = require("./routes/productRoute");
const reviewRoutes = require("./routes/reviewRoute");
const orderRoutes = require("./routes/orderRoute");

const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const { x } = require("joi");

//getting json in req.body
app.use(express.json());
app.use(morgan("tiny"));
app.use(cors());
//access cookine coming back gron the browser
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static("./public"));
app.use(fileUpload());
app.use(helmet());
app.use(xss());

//limiter palava
app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, //15min
    max: 60, //limit each IP to 60 requests per windowMs
  })
);
app.use(mongoSanitize());

app.get("/", (req, res) => {
  res.send("E commerce Api");
});

app.get("/api/v1", (req, res) => {
  console.log(req.signedCookies);
  res.send("E commerce Api");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/orders", orderRoutes);

//using the middlewares
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDb(process.env.MONGO_URL);
    app.listen(port, () => console.log(`Server started on port ${port}...`));
  } catch (error) {
    console.log(error);
  }
};

start();
