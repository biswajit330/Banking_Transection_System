// const { Router } = require("express");
// const authMiddleware = require("../middleware/auth.middleware");
// const transactionController = require("../controllers/transaction.controller");

// const transactionRoutes = Router();

// // GET /api/transactions - fetch user transaction history
// transactionRoutes.get(
//     "/",
//     authMiddleware.authMiddleware,
//     transactionController.getUserTransactions
// );

// // GET /api/transactions/ledger - fetch double-entry ledger audit trail
// transactionRoutes.get(
//     "/ledger",
//     authMiddleware.authMiddleware,
//     transactionController.getLedgerEntries
// );

// // GET /api/transactions/simulated-emails - view sent emails
// transactionRoutes.get(
//     "/simulated-emails",
//     authMiddleware.authMiddleware,
//     transactionController.getSimulatedEmailsController
// );

// // POST /api/transactions - transfer funds between accounts
// transactionRoutes.post(
//     "/",
//     authMiddleware.authMiddleware,
//     transactionController.createTransaction
// );

// // POST /api/transactions/system/initial-funds - treasury account injection
// transactionRoutes.post(
//     "/system/initial-funds",
//     authMiddleware.authSystemUserMiddleware,
//     transactionController.createInitialFundsTransaction
// );

// module.exports = transactionRoutes;


const { Router } = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const transactionController = require("../controllers/transaction.controller");

const transactionRoutes = Router();

// GET /api/transactions - fetch user transaction history
transactionRoutes.get(
    "/",
    authMiddleware.authMiddleware,
    transactionController.getUserTransactions
);

// GET /api/transactions/ledger - fetch double-entry ledger audit trail
transactionRoutes.get(
    "/ledger",
    authMiddleware.authMiddleware,
    transactionController.getLedgerEntries
);

// GET /api/transactions/simulated-emails - view sent emails
transactionRoutes.get(
    "/simulated-emails",
    authMiddleware.authMiddleware,
    transactionController.getSimulatedEmailsController
);

// POST /api/transactions - transfer funds between accounts
transactionRoutes.post(
    "/",
    authMiddleware.authMiddleware,
    transactionController.createTransaction
);

// POST /api/transactions/system/initial-funds - treasury account injection
transactionRoutes.post(
    "/system/initial-funds",
    authMiddleware.authMiddleware,
    transactionController.createInitialFundsTransaction
);

// POST /api/transactions/system/credit-treasury - deposit capital reserves into system treasury
transactionRoutes.post(
    "/system/credit-treasury",
    authMiddleware.authMiddleware,
    transactionController.creditSystemTreasury
);

// GET /api/transactions/system/treasury-status - inspect treasury reserve balance
transactionRoutes.get(
    "/system/treasury-status",
    authMiddleware.authMiddleware,
    transactionController.getTreasuryStatus
);

module.exports = transactionRoutes;
