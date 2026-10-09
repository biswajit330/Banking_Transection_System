const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require("./routes/auth.routes");
const accountRoutes = require("./routes/accounts.routes");
const transactionRoutes = require("./routes/transaction.routes");

const app = express();

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// API Health Check
app.get("/api/health", (req, res) => {
    res.json({
        status: "healthy",
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);

// Support both standard spelling and legacy spelling
app.use("/api/transactions", transactionRoutes);
app.use("/api/transection", transactionRoutes);

// Frontend static asset serving (from frontend/dist if built)
const frontendDistPath = path.resolve(__dirname, "../../frontend/dist");
const localDistPath = path.resolve(__dirname, "../frontend/dist");
const staticDir = fs.existsSync(frontendDistPath) ? frontendDistPath : (fs.existsSync(localDistPath) ? localDistPath : null);

if (staticDir) {
    app.use(express.static(staticDir));
    // SPA Fallback for client-side routing
    app.use((req, res, next) => {
        if (req.method === 'GET' && !req.path.startsWith('/api')) {
            return res.sendFile(path.join(staticDir, "index.html"));
        }
        next();
    });
}

module.exports = app;
