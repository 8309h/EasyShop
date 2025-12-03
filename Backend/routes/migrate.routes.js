const express = require("express");
const {
  migrateMenProducts,
  migrateWomenProducts,
} = require("../controllers/migrate.controller");

const migrateRouter = express.Router();

// Use POST for migration (GET also works, but POST is safe)
migrateRouter.post("/men", migrateMenProducts);
migrateRouter.post("/women", migrateWomenProducts);

module.exports = { migrateRouter };
