const path = require("path");
const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const xss = require("xss-clean");

const aboutRouter = require("./routes/aboutRoutes");
const bannerRouter = require("./routes/bannerRoutes");
const blogRouter = require("./routes/blogRoutes");
const caseRouter = require("./routes/caseRoutes");
const companyRouter = require("./routes/companyRoutes");
const emailRouter = require("./routes/emailRoutes");
const faqRouter = require("./routes/faqRoutes");
const notificationRouter = require("./routes/notificationRoutes");
const partnerRouter = require("./routes/partnerRoutes");
const productController = require("./controllers/productController");
const promotionRouter = require("./routes/promoRoutes");
const transactionController = require("./controllers/transactionController");
const productRouter = require("./routes/productRoutes");
const officialRouter = require("./routes/officialRoutes");
const smsRouter = require("./routes/smsRoutes");
const staffRouter = require("./routes/staffRoutes");
const placesRouter = require("./routes/placeRoutes");
const termsRouter = require("./routes/termsRoutes");
const transactionsRouter = require("./routes/transactionRoutes");
const userRouter = require("./routes/userRoutes");
const userController = require("./controllers/userController");

const globalErrorHandler = require("./controllers/errorController");

dotenv.config({ path: "./config.env" });

const app = express();
const server = require("http").createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("New WS connection");
  userController.fetchUsers(io, socket);
  transactionController.createOrder(io, socket);
  transactionController.cancelOrder(io, socket);
  transactionController.approveOrder(io, socket);

  // chatController.createChat(io, socket);
  // chatController.endChat(io, socket);
  // chatController.getRooms(io, socket);
  // chatController.getOffices(io, socket);
  productController.fetchItems(io, socket);
  // orderController.updateOrder(io, socket);
  // orderController.createOrder(io, socket);
});

app.use("/var/lib/data", express.static(path.join(__dirname, "var/lib/data")));

app.use(xss());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan("dev")); // configire morgan

app.use("/api/about", aboutRouter);
app.use("/api/banner", bannerRouter);
app.use("/api/blogs", blogRouter);
app.use("/api/case", caseRouter);
app.use("/api/company", companyRouter);
app.use("/api/emails", emailRouter);
app.use("/api/faq", faqRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/officials", officialRouter);
app.use("/api/partners", partnerRouter);
app.use("/api/products", productRouter);
app.use("/api/promotions", promotionRouter);
app.use("/api/sms", smsRouter);
app.use("/api/places", placesRouter);
app.use("/api/staffs", staffRouter);
app.use("/api/terms", termsRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/users", userRouter);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/dist/")));
  app.get("*", (req, res) => {
    res.sendFile(__dirname + "/dist/index.html");
  });
}

app.use(globalErrorHandler);

module.exports = server;
