const { ProductModel } = require("../models/Product.model");

async function createProduct(req, res) {
  try {
    const { title, image, description, price, category } = req.body;

    const product = new ProductModel({
      title,
      image,
      description,
      price,
      category,
    });

    await product.save();

    res.status(201).json({ msg: "Product created", product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Not able to add product" });
  }
}

async function getProducts(req, res) {
  try {
    const {
      category,
      search,
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isDeleted: false };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const sortOption = {};
    sortOption[sort] = order === "asc" ? 1 : -1;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const [products, total] = await Promise.all([
      ProductModel.find(query)
        .sort(sortOption)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      ProductModel.countDocuments(query),
    ]);

    res.json({
      data: products,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching products" });
  }
}

async function getProductById(req, res) {
  try {
    const product = await ProductModel.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching product" });
  }
}

async function updateProduct(req, res) {
  try {
    const updated = await ProductModel.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { $set: req.body },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ msg: "Product not found" });
    }

    res.json({ msg: "Product updated successfully", product: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error updating product" });
  }
}

async function deleteProduct(req, res) {
  try {
    const deleted = await ProductModel.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (!deleted) {
      return res.status(404).json({ msg: "Product not found" });
    }

    res.json({ msg: "Product deleted (soft delete)", product: deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error deleting product" });
  }
}

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
