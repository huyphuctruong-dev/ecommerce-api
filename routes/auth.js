
const express = require("express");
const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const jwt = require("jsonwebtoken");

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, fullname, password } = req.body;

    // Kiểm tra dữ liệu bắt buộc
    if (
      typeof username !== "string" ||
      username.trim() === "" ||
      typeof fullname !== "string" ||
      fullname.trim() === "" ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        success: false,
        message:
  "Provide username, fullname and password (at least 8 characters)",
      });
    }

    // Kiểm tra username đã tồn tại
    const existingUser = await prisma.user.findUnique({
      where: { username: username.trim() },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Username already exists",
      });
    }

    // Băm mật khẩu
    const hashedPassword = await bcrypt.hash(password, 12);

    // Tạo tài khoản
    const user = await prisma.user.create({
      data: {
  username: username.trim(),
  fullname: fullname.trim(),
  password: hashedPassword,
  roleid: 1,
  mid: 1,
},
      select: {
        uid: true,
        username: true,
        fullname: true,
        roleid: true,
        mid: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Account registered successfully",
      data: user,
    });
  } catch (error) {
    console.error("Registration error:", error);
    console.error("Error code:", error.code);
console.error("Error message:", error.message);
console.error("Error meta:", error.meta);

    if (error.code === "P2003") {
  return res.status(400).json({
    success: false,
    message: "Invalid roleid or mid",
    errorCode: error.code,
    errorMeta: error.meta,
  });
}

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Username already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to register account",
    });
  }
});



// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      typeof username !== "string" ||
      username.trim() === "" ||
      typeof password !== "string" ||
      password === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { username: username.trim() },
    });

    // Dùng cùng một thông báo để tránh tiết lộ tài khoản có tồn tại hay không.
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const token = jwt.sign(
      {
        uid: user.uid,
        username: user.username,
        roleid: user.roleid,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        uid: user.uid,
        username: user.username,
        fullname: user.fullname,
        roleid: user.roleid,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to log in",
    });
  }
});

module.exports = router;
