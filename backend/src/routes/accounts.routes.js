const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const accountController = require("../controllers/account.controller");

const router = express.Router();

// POST /api/accounts - create account
router.post("/", authMiddleware.authMiddleware, accountController.createAccountController);

// GET /api/accounts - list user's accounts with live balances
router.get("/", authMiddleware.authMiddleware, accountController.getUserAccountsController);

// GET /api/accounts/directory - counterparties directory for easy transfer selection
router.get("/directory", authMiddleware.authMiddleware, accountController.getTransferDirectoryController);

// GET /api/accounts/:accountId/balance - get calculated balance from double-entry ledger
router.get("/:accountId/balance", authMiddleware.authMiddleware, accountController.getAccountBalanceController);

module.exports = router;
