const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const tokenBlackListModel = require("../models/blackList.model");

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_dev";

async function authMiddleware(req, res, next) {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized access, token is missing",
            status: "failed"
        });
    }

    try {
        const isBlacklisted = await tokenBlackListModel.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({
                message: "Unauthorized access, token is invalid",
                status: "failed"
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await userModel.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                message: "Unauthorized access, user not found",
                status: "failed"
            });
        }

        req.user = user;
        return next();
    } catch (err) {
        return res.status(401).json({
            message: "Unauthorized access, token is invalid: " + err.message,
            status: "failed"
        });
    }
}

async function authSystemUserMiddleware(req, res, next) {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized access, token is missing",
            status: "failed"
        });
    }

    try {
        const isBlacklisted = await tokenBlackListModel.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({
                message: "Unauthorized access, token is invalid",
                status: "failed"
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await userModel.findById(decoded.userId).select("+systemUser");

        if (!user || !user.systemUser) {
            return res.status(403).json({
                message: "Forbidden access, not a system user",
                status: "failed"
            });
        }

        req.user = user;
        return next();
    } catch (err) {
        return res.status(401).json({
            message: "Unauthorized access, token is invalid: " + err.message,
            status: "failed"
        });
    }
}

module.exports = {
    authMiddleware,
    authSystemUserMiddleware
};
