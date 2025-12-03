const { MenProductModel, WomenProductModel } = require("../models/pp.model"); 
// Rename file as per your project
const { ProductModel } = require("../models/Product.model");

// ----- Migrate MEN Products -----
async function migrateMenProducts(req, res) {
  try {
    const oldProducts = await MenProductModel.find();

    if (!oldProducts.length) {
      return res.status(404).json({ msg: "No men products found in old collection" });
    }

    const newProducts = oldProducts.map((prod) => ({
      title: prod.Title,
      image: prod.Image,
      description: prod.Description,
      price: prod.Price,
      category: "men",
    }));

    const inserted = await ProductModel.insertMany(newProducts);

    res.json({
      msg: "Men products migrated successfully",
      totalMigrated: inserted.length,
      inserted,
    });
  } catch (err) {
    console.error("Migration error:", err);
    res.status(500).json({ msg: "Error migrating men products", error: err.message });
  }
}

// ----- Migrate WOMEN Products -----
async function migrateWomenProducts(req, res) {
  try {
    const oldProducts = await WomenProductModel.find();

    if (!oldProducts.length) {
      return res.status(404).json({ msg: "No women products found in old collection" });
    }

    const newProducts = oldProducts.map((prod) => ({
      title: prod.Title,
      image: prod.Image,
      description: prod.Description,
      price: prod.Price,
      category: "women",
    }));

    const inserted = await ProductModel.insertMany(newProducts);

    res.json({
      msg: "Women products migrated successfully",
      totalMigrated: inserted.length,
      inserted,
    });
  } catch (err) {
    console.error("Migration error:", err);
    res.status(500).json({ msg: "Error migrating women products", error: err.message });
  }
}

module.exports = {
  migrateMenProducts,
  migrateWomenProducts,
};
