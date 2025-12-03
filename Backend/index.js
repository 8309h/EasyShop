require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { connection } = require("./config/db");

const { userRouter } = require("./routes/user.routes");
const { productRouter } = require("./routes/product.routes");
const { cartRouter } = require("./routes/cart.routes");
const { orderRouter } = require("./routes/order.routes");
const { errorHandler } = require("./middlewares/error.middleware");

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});
app.use("/api", apiLimiter);

// Routes
app.get("/", (req, res) => {
  res.send("Home-Page of EasyShop_the shopping hub");
});
const { migrateRouter } = require("./routes/migrate.routes");
app.use("/api/migrate", migrateRouter);


app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 8080;

app.listen(PORT, async () => {
  try {
    await connection;
    console.log("✅ Connected successfully to database");
  } catch (err) {
    console.log("❌ Database connection failed", err.message);
  }
  console.log(`🚀 Server running at port ${PORT}`);
});
