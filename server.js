
require("dotenv").config();

const express = require("express");
const prisma = require("./config/prisma");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3001;

const authMiddleware = require("./middleware/authMiddleware");

app.use(express.json());

app.use("/api/auth", authRoutes);
// Trang chủ
app.get("/", (req, res) => {
  res.json({
    message: "E-commerce RESTful API is running",
    version: "1.0.0",
  });
});

// Health check
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      status: "ok",
      message: "E-commerce API is healthy",
      database: "connected",
    });
  } catch (error) {
    console.error("Health check database error:", error);

    return res.status(503).json({
      status: "error",
      message: "E-commerce API is unhealthy",
      database: "disconnected",
    });
  }
});

// Lấy danh sách sản phẩm
app.get("/api/products", async (req, res) => {
  try {
    const products = await prisma.product.findMany();

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
});


app.get("/api/products/:pid", async (req, res) => {
  try {
    const pid = Number(req.params.pid);

    if (!Number.isInteger(pid) || pid <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product ID must be a positive integer",
      });
    }

    const product = await prisma.product.findUnique({
      where: { pid },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
});


app.put("/api/products/:pid", async (req, res) => {
  try {
    const pid = Number(req.params.pid);
    const { pname, price, quantity } = req.body;

    if (!Number.isInteger(pid) || pid <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product ID must be a positive integer",
      });
    }

    if (
      (pname !== undefined &&
        (typeof pname !== "string" || pname.trim() === "")) ||
      (price !== undefined &&
        (!Number.isFinite(Number(price)) || Number(price) < 0)) ||
      (quantity !== undefined &&
        (!Number.isInteger(quantity) || quantity < 0))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product data",
      });
    }

    if (
      pname === undefined &&
      price === undefined &&
      quantity === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { pid },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const data = {};

    if (pname !== undefined) data.pname = pname.trim();
    if (price !== undefined) data.price = Number(price);
    if (quantity !== undefined) data.quantity = quantity;

    const updatedProduct = await prisma.product.update({
      where: { pid },
      data,
    });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
});


app.delete("/api/products/:pid", async (req, res) => {
  try {
    const pid = Number(req.params.pid);

    if (!Number.isInteger(pid) || pid <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product ID must be a positive integer",
      });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { pid },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await prisma.product.delete({
      where: { pid },
    });

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
});



app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { uid: req.user.uid },
      select: {
        uid: true,
        username: true,
        fullname: true,
        roleid: true,
        mid: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get current user",
    });
  }
});




app.post("/api/products", async (req, res) => {
  try {
    const { pname, price, quantity } = req.body;

    if (
      typeof pname !== "string" ||
      pname.trim() === "" ||
      price === undefined ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0 ||
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "pname must be non-empty, price must be non-negative, and quantity must be a non-negative integer",
      });
    }

    const product = await prisma.product.create({
      data: {
        pname: pname.trim(),
        price: Number(price),
        quantity,
      },
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error creating product:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
