// const transactionModel = require("../models/transaction.model");
// const ledgerModel = require("../models/ledger.model");
// const accountModel = require("../models/account.model");
// const emailService = require("../services/email.service");
// const mongoose = require("mongoose");

// /**
//  * - Create a new transaction
//  * THE 10-STEP DOUBLE-ENTRY TRANSFER FLOW:
//  * 1. Validate request
//  * 2. Verify account ownership
//  * 3. Validate idempotency key
//  * 4. Check account status
//  * 5. Derive sender balance from ledger
//  * 6. Create transaction (PENDING)
//  * 7. Create DEBIT ledger entry
//  * 8. Create CREDIT ledger entry
//  * 9. Mark transaction COMPLETED & Commit session
//  * 10. Send email notification
//  */
// async function createTransaction(req, res) {
//     /**
//      * 1. Validate request
//      */
//     const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

//     if (!fromAccount || !toAccount || amount === undefined || amount === null || !idempotencyKey) {
//         return res.status(400).json({
//             message: "fromAccount, toAccount, amount and idempotencyKey are required",
//             status: "failed"
//         });
//     }

//     const numericAmount = Number(amount);
//     if (isNaN(numericAmount) || numericAmount <= 0) {
//         return res.status(400).json({
//             message: "Amount must be a positive number greater than zero",
//             status: "failed"
//         });
//     }

//     if (fromAccount === toAccount) {
//         return res.status(400).json({
//             message: "Source and destination accounts cannot be identical",
//             status: "failed"
//         });
//     }

//     const fromUserAccount = await accountModel.findById(fromAccount);
//     const toUserAccount = await accountModel.findById(toAccount);

//     if (!fromUserAccount || !toUserAccount) {
//         return res.status(400).json({
//             message: "Invalid fromAccount or toAccount",
//             status: "failed"
//         });
//     }

//     /**
//      * 2. Verify account ownership
//      */
//     if (fromUserAccount.user.toString() !== req.user._id.toString()) {
//         return res.status(403).json({
//             message: "You are not authorized to transfer funds from this account",
//             status: "failed"
//         });
//     }

//     /**
//      * 3. Validate idempotency key
//      */
//     const existingTransaction = await transactionModel.findOne({
//         idempotencyKey: idempotencyKey
//     });

//     if (existingTransaction) {
//         if (existingTransaction.status === "COMPLETED") {
//             return res.status(200).json({
//                 message: "Transaction already processed",
//                 status: "success",
//                 transaction: existingTransaction
//             });
//         }

//         if (existingTransaction.status === "PENDING") {
//             return res.status(200).json({
//                 message: "Transaction is still processing",
//                 status: "pending",
//                 transaction: existingTransaction
//             });
//         }

//         if (existingTransaction.status === "FAILED") {
//             return res.status(500).json({
//                 message: "Previous transaction attempt failed, please generate a new idempotency key",
//                 status: "failed"
//             });
//         }

//         if (existingTransaction.status === "REVERSED") {
//             return res.status(500).json({
//                 message: "Transaction was reversed, please retry with a new idempotency key",
//                 status: "failed"
//             });
//         }
//     }

//     /**
//      * 4. Check account status
//      */
//     if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
//         return res.status(400).json({
//             message: "Both fromAccount and toAccount must be ACTIVE to process transaction",
//             status: "failed"
//         });
//     }

//     /**
//      * 5. Derive sender balance from ledger
//      */
//     const balance = await fromUserAccount.getBalance();

//     if (balance < numericAmount) {
//         return res.status(400).json({
//             message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${numericAmount}`,
//             status: "failed"
//         });
//     }

//     let transaction;
//     const session = await mongoose.startSession();

//     try {
//         session.startTransaction();

//         // 6. Create transaction (PENDING)
//         const createdTxs = await transactionModel.create([
//             {
//                 fromAccount,
//                 toAccount,
//                 amount: numericAmount,
//                 idempotencyKey,
//                 status: "PENDING"
//             }
//         ], { session });

//         transaction = createdTxs[0];

//         // 7. Create DEBIT ledger entry
//         await ledgerModel.create([
//             {
//                 account: fromAccount,
//                 amount: numericAmount,
//                 transaction: transaction._id,
//                 type: "DEBIT"
//             }
//         ], { session });

//         // 8. Create CREDIT ledger entry
//         await ledgerModel.create([
//             {
//                 account: toAccount,
//                 amount: numericAmount,
//                 transaction: transaction._id,
//                 type: "CREDIT"
//             }
//         ], { session });

//         // 9. Mark transaction COMPLETED
//         await transactionModel.findOneAndUpdate(
//             { _id: transaction._id },
//             { status: "COMPLETED" },
//             { session }
//         );

//         transaction.status = "COMPLETED";

//         await session.commitTransaction();
//     } catch (error) {
//         if (session.inTransaction()) {
//             await session.abortTransaction().catch(() => {});
//         }
//         console.error("Transfer transaction error:", error);
//         return res.status(400).json({
//             message: "Transaction processing failed: " + error.message,
//             status: "failed"
//         });
//     } finally {
//         await session.endSession();
//     }

//     /**
//      * 10. Send email notification (non-blocking)
//      */
//     emailService.sendTransactionEmail(req.user.email, req.user.name, numericAmount, toAccount)
//         .catch(err => console.warn("Email notify error:", err.message));

//     return res.status(201).json({
//         message: "Transaction completed successfully",
//         status: "success",
//         transaction: transaction
//     });
// }

// /**
//  * POST /api/transactions/system/initial-funds
//  * Create initial funds transaction from system treasury user
//  */
// async function createInitialFundsTransaction(req, res) {
//     const { toAccount, amount, idempotencyKey } = req.body;

//     if (!toAccount || amount === undefined || amount === null || !idempotencyKey) {
//         return res.status(400).json({
//             message: "toAccount, amount and idempotencyKey are required",
//             status: "failed"
//         });
//     }

//     const numericAmount = Number(amount);
//     if (isNaN(numericAmount) || numericAmount <= 0) {
//         return res.status(400).json({
//             message: "Amount must be a positive number",
//             status: "failed"
//         });
//     }

//     const toUserAccount = await accountModel.findById(toAccount);
//     if (!toUserAccount) {
//         return res.status(400).json({
//             message: "Invalid destination account",
//             status: "failed"
//         });
//     }

//     const fromUserAccount = await accountModel.findOne({
//         user: req.user._id
//     });

//     if (!fromUserAccount) {
//         return res.status(400).json({
//             message: "System user account not found",
//             status: "failed"
//         });
//     }

//     const session = await mongoose.startSession();
//     let transaction;

//     try {
//         session.startTransaction();

//         const createdTxs = await transactionModel.create([
//             {
//                 fromAccount: fromUserAccount._id,
//                 toAccount,
//                 amount: numericAmount,
//                 idempotencyKey,
//                 status: "PENDING"
//             }
//         ], { session });

//         transaction = createdTxs[0];

//         await ledgerModel.create([
//             {
//                 account: fromUserAccount._id,
//                 amount: numericAmount,
//                 transaction: transaction._id,
//                 type: "DEBIT"
//             }
//         ], { session });

//         await ledgerModel.create([
//             {
//                 account: toAccount,
//                 amount: numericAmount,
//                 transaction: transaction._id,
//                 type: "CREDIT"
//             }
//         ], { session });

//         await transactionModel.findOneAndUpdate(
//             { _id: transaction._id },
//             { status: "COMPLETED" },
//             { session }
//         );

//         transaction.status = "COMPLETED";

//         await session.commitTransaction();
//     } catch (err) {
//         if (session.inTransaction()) {
//             await session.abortTransaction().catch(() => {});
//         }
//         console.error("Initial funds error:", err);
//         return res.status(400).json({
//             message: "Failed to allocate funds: " + err.message,
//             status: "failed"
//         });
//     } finally {
//         await session.endSession();
//     }

//     return res.status(201).json({
//         message: "Initial funds transaction completed successfully",
//         status: "success",
//         transaction: transaction
//     });
// }

// /**
//  * GET /api/transactions
//  * Retrieve transactions for current user's accounts
//  */
// async function getUserTransactions(req, res) {
//     try {
//         const userAccounts = await accountModel.find({ user: req.user._id });
//         const accountIds = userAccounts.map(a => a._id);

//         const transactions = await transactionModel.find({
//             $or: [
//                 { fromAccount: { $in: accountIds } },
//                 { toAccount: { $in: accountIds } }
//             ]
//         })
//         .sort({ createdAt: -1 })
//         .populate("fromAccount", "currency")
//         .populate("toAccount", "currency")
//         .limit(100);

//         return res.status(200).json({
//             status: "success",
//             transactions
//         });
//     } catch (err) {
//         return res.status(500).json({
//             message: "Failed to retrieve transactions: " + err.message,
//             status: "failed"
//         });
//     }
// }

// /**
//  * GET /api/transactions/ledger
//  * Retrieve ledger audit records for current user
//  */
// async function getLedgerEntries(req, res) {
//     try {
//         const userAccounts = await accountModel.find({ user: req.user._id });
//         const accountIds = userAccounts.map(a => a._id);

//         const entries = await ledgerModel.find({
//             account: { $in: accountIds }
//         })
//         .sort({ _id: -1 })
//         .limit(100);

//         return res.status(200).json({
//             status: "success",
//             entries
//         });
//     } catch (err) {
//         return res.status(500).json({
//             message: "Failed to retrieve ledger entries: " + err.message,
//             status: "failed"
//         });
//     }
// }

// /**
//  * GET /api/transactions/simulated-emails
//  * View simulated email delivery log
//  */
// async function getSimulatedEmailsController(req, res) {
//     try {
//         const emails = emailService.getRecentSimulatedEmails();
//         return res.status(200).json({
//             status: "success",
//             emails
//         });
//     } catch (err) {
//         return res.status(500).json({
//             message: "Failed to fetch email logs",
//             status: "failed"
//         });
//     }
// }

// module.exports = {
//     createTransaction,
//     createInitialFundsTransaction,
//     getUserTransactions,
//     getLedgerEntries,
//     getSimulatedEmailsController
// };

const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const accountModel = require("../models/account.model");
const userModel = require("../models/user.model");
const emailService = require("../services/email.service");
const mongoose = require("mongoose");

/**
 * - Create a new transaction
 * THE 10-STEP DOUBLE-ENTRY TRANSFER FLOW:
 * 1. Validate request
 * 2. Verify account ownership
 * 3. Validate idempotency key
 * 4. Check account status
 * 5. Derive sender balance from ledger
 * 6. Create transaction (PENDING)
 * 7. Create DEBIT ledger entry
 * 8. Create CREDIT ledger entry
 * 9. Mark transaction COMPLETED & Commit session
 * 10. Send email notification
 */
async function createTransaction(req, res) {
    /**
     * 1. Validate request
     */
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    if (!fromAccount || !toAccount || amount === undefined || amount === null || !idempotencyKey) {
        return res.status(400).json({
            message: "fromAccount, toAccount, amount and idempotencyKey are required",
            status: "failed"
        });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({
            message: "Amount must be a positive number greater than zero",
            status: "failed"
        });
    }

    if (fromAccount === toAccount) {
        return res.status(400).json({
            message: "Source and destination accounts cannot be identical",
            status: "failed"
        });
    }

    const fromUserAccount = await accountModel.findById(fromAccount);
    const toUserAccount = await accountModel.findById(toAccount);

    if (!fromUserAccount || !toUserAccount) {
        return res.status(400).json({
            message: "Invalid fromAccount or toAccount",
            status: "failed"
        });
    }

    /**
     * 2. Verify account ownership
     */
    if (fromUserAccount.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            message: "You are not authorized to transfer funds from this account",
            status: "failed"
        });
    }

    /**
     * 3. Validate idempotency key
     */
    const existingTransaction = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    });

    if (existingTransaction) {
        if (existingTransaction.status === "COMPLETED") {
            return res.status(200).json({
                message: "Transaction already processed",
                status: "success",
                transaction: existingTransaction
            });
        }

        if (existingTransaction.status === "PENDING") {
            return res.status(200).json({
                message: "Transaction is still processing",
                status: "pending",
                transaction: existingTransaction
            });
        }

        if (existingTransaction.status === "FAILED") {
            return res.status(500).json({
                message: "Previous transaction attempt failed, please generate a new idempotency key",
                status: "failed"
            });
        }

        if (existingTransaction.status === "REVERSED") {
            return res.status(500).json({
                message: "Transaction was reversed, please retry with a new idempotency key",
                status: "failed"
            });
        }
    }

    /**
     * 4. Check account status
     */
    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
        return res.status(400).json({
            message: "Both fromAccount and toAccount must be ACTIVE to process transaction",
            status: "failed"
        });
    }

    /**
     * 5. Derive sender balance from ledger
     */
    const balance = await fromUserAccount.getBalance();

    if (balance < numericAmount) {
        return res.status(400).json({
            message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${numericAmount}`,
            status: "failed"
        });
    }

    let transaction;
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // 6. Create transaction (PENDING)
        const createdTxs = await transactionModel.create([
            {
                fromAccount,
                toAccount,
                amount: numericAmount,
                idempotencyKey,
                status: "PENDING"
            }
        ], { session });

        transaction = createdTxs[0];

        // 7. Create DEBIT ledger entry
        await ledgerModel.create([
            {
                account: fromAccount,
                amount: numericAmount,
                transaction: transaction._id,
                type: "DEBIT"
            }
        ], { session });

        // 8. Create CREDIT ledger entry
        await ledgerModel.create([
            {
                account: toAccount,
                amount: numericAmount,
                transaction: transaction._id,
                type: "CREDIT"
            }
        ], { session });

        // 9. Mark transaction COMPLETED
        await transactionModel.findOneAndUpdate(
            { _id: transaction._id },
            { status: "COMPLETED" },
            { session }
        );

        transaction.status = "COMPLETED";

        await session.commitTransaction();
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction().catch(() => {});
        }
        console.error("Transfer transaction error:", error);
        return res.status(400).json({
            message: "Transaction processing failed: " + error.message,
            status: "failed"
        });
    } finally {
        await session.endSession();
    }

    /**
     * 10. Send email notification (non-blocking)
     */
    emailService.sendTransactionEmail(req.user.email, req.user.name, numericAmount, toAccount)
        .catch(err => console.warn("Email notify error:", err.message));

    return res.status(201).json({
        message: "Transaction completed successfully",
        status: "success",
        transaction: transaction
    });
}

/**
 * POST /api/transactions/system/initial-funds
 * Create initial funds transaction from system treasury user
 */
async function createInitialFundsTransaction(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body;

    if (!toAccount || amount === undefined || amount === null || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey are required",
            status: "failed"
        });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({
            message: "Amount must be a positive number",
            status: "failed"
        });
    }

    const toUserAccount = await accountModel.findById(toAccount);
    if (!toUserAccount) {
        return res.status(400).json({
            message: "Invalid destination account",
            status: "failed"
        });
    }

    let systemUser = await userModel.findOne({ systemUser: true });
    if (!systemUser) {
        systemUser = await userModel.findOne({ email: "system@ledgerpay.internal" });
    }

    if (!systemUser) {
        return res.status(400).json({
            message: "System user not found",
            status: "failed"
        });
    }

    const fromUserAccount = await accountModel.findOne({
        user: systemUser._id
    });

    if (!fromUserAccount) {
        return res.status(400).json({
            message: "System user account not found",
            status: "failed"
        });
    }

    const session = await mongoose.startSession();
    let transaction;

    try {
        session.startTransaction();

        const createdTxs = await transactionModel.create([
            {
                fromAccount: fromUserAccount._id,
                toAccount,
                amount: numericAmount,
                idempotencyKey,
                status: "PENDING"
            }
        ], { session });

        transaction = createdTxs[0];

        await ledgerModel.create([
            {
                account: fromUserAccount._id,
                amount: numericAmount,
                transaction: transaction._id,
                type: "DEBIT"
            }
        ], { session });

        await ledgerModel.create([
            {
                account: toAccount,
                amount: numericAmount,
                transaction: transaction._id,
                type: "CREDIT"
            }
        ], { session });

        await transactionModel.findOneAndUpdate(
            { _id: transaction._id },
            { status: "COMPLETED" },
            { session }
        );

        transaction.status = "COMPLETED";

        await session.commitTransaction();
    } catch (err) {
        if (session.inTransaction()) {
            await session.abortTransaction().catch(() => {});
        }
        console.error("Initial funds error:", err);
        return res.status(400).json({
            message: "Failed to allocate funds: " + err.message,
            status: "failed"
        });
    } finally {
        await session.endSession();
    }

    return res.status(201).json({
        message: "Initial funds transaction completed successfully",
        status: "success",
        transaction: transaction
    });
}

/**
 * GET /api/transactions
 * Retrieve transactions for current user's accounts
 */
async function getUserTransactions(req, res) {
    try {
        const userAccounts = await accountModel.find({ user: req.user._id });
        const accountIds = userAccounts.map(a => a._id);

        const transactions = await transactionModel.find({
            $or: [
                { fromAccount: { $in: accountIds } },
                { toAccount: { $in: accountIds } }
            ]
        })
        .sort({ createdAt: -1 })
        .populate("fromAccount", "currency")
        .populate("toAccount", "currency")
        .limit(100);

        return res.status(200).json({
            status: "success",
            transactions
        });
    } catch (err) {
        return res.status(500).json({
            message: "Failed to retrieve transactions: " + err.message,
            status: "failed"
        });
    }
}

/**
 * GET /api/transactions/ledger
 * Retrieve ledger audit records for current user
 */
async function getLedgerEntries(req, res) {
    try {
        const userAccounts = await accountModel.find({ user: req.user._id });
        const accountIds = userAccounts.map(a => a._id);

        const entries = await ledgerModel.find({
            account: { $in: accountIds }
        })
        .sort({ _id: -1 })
        .limit(100);

        return res.status(200).json({
            status: "success",
            entries
        });
    } catch (err) {
        return res.status(500).json({
            message: "Failed to retrieve ledger entries: " + err.message,
            status: "failed"
        });
    }
}

/**
 * POST /api/transactions/system/credit-treasury
 * Injects capital reserves directly into the system treasury account (CREDIT entry)
 */
async function creditSystemTreasury(req, res) {
    try {
        const { amount = 1000000, idempotencyKey = `treasury_cap_${Date.now()}` } = req.body;
        const numericAmount = Number(amount);

        if (isNaN(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({
                message: "Amount must be a positive number",
                status: "failed"
            });
        }

        let systemUser = await userModel.findOne({ systemUser: true });
        if (!systemUser) {
            systemUser = await userModel.findOne({ email: "system@ledgerpay.internal" });
        }

        if (!systemUser) {
            return res.status(404).json({
                message: "System treasury user not found",
                status: "failed"
            });
        }

        let systemAccount = await accountModel.findOne({ user: systemUser._id });
        if (!systemAccount) {
            return res.status(404).json({
                message: "System treasury account not found",
                status: "failed"
            });
        }

        const session = await mongoose.startSession();
        let transaction;

        try {
            session.startTransaction();

            const createdTxs = await transactionModel.create([
                {
                    fromAccount: systemAccount._id,
                    toAccount: systemAccount._id,
                    amount: numericAmount,
                    idempotencyKey,
                    status: "COMPLETED"
                }
            ], { session });

            transaction = createdTxs[0];

            await ledgerModel.create([
                {
                    account: systemAccount._id,
                    amount: numericAmount,
                    transaction: transaction._id,
                    type: "CREDIT"
                }
            ], { session });

            await session.commitTransaction();
        } catch (err) {
            if (session.inTransaction()) {
                await session.abortTransaction().catch(() => {});
            }
            throw err;
        } finally {
            await session.endSession();
        }

        const currentBalance = await systemAccount.getBalance();

        return res.status(201).json({
            message: `Successfully credited ₹${numericAmount.toLocaleString('en-IN')} into System Treasury reserves!`,
            status: "success",
            treasuryAccount: systemAccount._id,
            creditedAmount: numericAmount,
            currentBalance,
            transaction
        });
    } catch (err) {
        return res.status(500).json({
            message: "Failed to credit treasury: " + err.message,
            status: "failed"
        });
    }
}

/**
 * GET /api/transactions/system/treasury-status
 * Inspect system treasury account reserve balance
 */
async function getTreasuryStatus(req, res) {
    try {
        let systemUser = await userModel.findOne({ systemUser: true });
        if (!systemUser) {
            systemUser = await userModel.findOne({ email: "system@ledgerpay.internal" });
        }

        if (!systemUser) {
            return res.status(404).json({
                message: "System treasury user not found",
                status: "failed"
            });
        }

        let systemAccount = await accountModel.findOne({ user: systemUser._id });
        if (!systemAccount) {
            return res.status(404).json({
                message: "System treasury account not found",
                status: "failed"
            });
        }

        const balance = await systemAccount.getBalance();
        const entries = await ledgerModel.find({ account: systemAccount._id });
        const totalCredits = entries.filter(e => e.type === "CREDIT").reduce((s, e) => s + e.amount, 0);
        const totalDebits = entries.filter(e => e.type === "DEBIT").reduce((s, e) => s + e.amount, 0);

        return res.status(200).json({
            status: "success",
            treasury: {
                accountId: systemAccount._id,
                currency: systemAccount.currency || "INR",
                balance,
                totalCredits,
                totalDebits,
                entryCount: entries.length
            }
        });
    } catch (err) {
        return res.status(500).json({
            message: "Failed to get treasury status: " + err.message,
            status: "failed"
        });
    }
}

/**
 * GET /api/transactions/simulated-emails
 * View simulated email delivery log
 */
async function getSimulatedEmailsController(req, res) {
    try {
        const emails = emailService.getRecentSimulatedEmails();
        return res.status(200).json({
            status: "success",
            emails
        });
    } catch (err) {
        return res.status(500).json({
            message: "Failed to fetch email logs",
            status: "failed"
        });
    }
}

module.exports = {
    createTransaction,
    createInitialFundsTransaction,
    creditSystemTreasury,
    getTreasuryStatus,
    getUserTransactions,
    getLedgerEntries,
    getSimulatedEmailsController
};

