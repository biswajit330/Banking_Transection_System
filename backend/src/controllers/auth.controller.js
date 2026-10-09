const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const tokenBlackListModel = require("../models/blackList.model");
const emailServices = require("../services/email.service");

/*
user register controller
POST /api/auth/register (also supports /resister)
*/
async function userResisterController(req, res) {
  console.log("Registration body:", req.body);
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        message: "Name, email and password are required",
        status: "failed"
      });
    }

    const isExist = await userModel.findOne({
      email: email.toLowerCase().trim()
    });

    if (isExist) {
      return res.status(422).json({
        message: "User already exists with this email",
        status: "failed"
      });
    }

    const user = await userModel.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password
    });

    // Send registration email (gracefully simulated if credentials unconfigured)
    await emailServices.sendRegistrationEmail(
      user.email,
      user.name
    );

    // Create JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "default_jwt_secret_dev"
    );

    // Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000
    });

    return res.status(201).json({
      message: "User registered successfully",
      status: "success",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      message: "Internal server error: " + error.message,
      status: "failed"
    });
  }
}

/*
user login controller
POST /api/auth/login
*/
async function userLoginController(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
        status: "failed"
      });
    }

    const user = await userModel.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "default_jwt_secret_dev"
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000
    });

    return res.status(200).json({
      message: "Login successful",
      status: "success",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Internal server error",
      status: "failed"
    });
  }
}

/*
user logout controller
POST /api/auth/logout
*/
async function userLogoutController(req, res) {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (token) {
      await tokenBlackListModel.create({ token }).catch(() => {});
    }

    res.clearCookie("token");

    return res.status(200).json({
      message: "Logout successful",
      status: "success"
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      message: "Internal server error",
      status: "failed"
    });
  }
}

/*
current user profile controller
GET /api/auth/me
*/
async function userProfileController(req, res) {
  try {
    return res.status(200).json({
      status: "success",
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      status: "failed"
    });
  }
}

module.exports = {
  userResisterController,
  userRegisterController: userResisterController,
  userLoginController,
  userLogoutController,
  userProfileController
};
