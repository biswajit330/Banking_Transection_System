const accountModel = require("../models/account.model");
const userModel = require("../models/user.model");

async function createAccountController(req, res) {
    try {
        const user = req.user;
        const currency = req.body.currency || "INR";

        const account = await accountModel.create({
            user: user._id,
            currency: currency
        });

        res.status(201).json({
            status: "success",
            account: {
                ...account.toObject(),
                balance: 0
            }
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to create account: " + err.message,
            status: "failed"
        });
    }
}

async function getUserAccountsController(req, res) {
    try {
        const rawAccounts = await accountModel.find({ user: req.user._id });
        
        const accounts = await Promise.all(
            rawAccounts.map(async (acc) => {
                const balance = await acc.getBalance();
                return {
                    _id: acc._id,
                    user: acc.user,
                    status: acc.status,
                    currency: acc.currency,
                    createdAt: acc.createdAt,
                    updatedAt: acc.updatedAt,
                    balance: balance
                };
            })
        );

        res.status(200).json({
            status: "success",
            accounts
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to retrieve accounts: " + err.message,
            status: "failed"
        });
    }
}

async function getAccountBalanceController(req, res) {
    try {
        const { accountId } = req.params;

        const account = await accountModel.findOne({
            _id: accountId,
            user: req.user._id
        });

        if (!account) {
            return res.status(404).json({
                message: "Account not found",
                status: "failed"
            });
        }

        const balance = await account.getBalance();

        res.status(200).json({
            status: "success",
            accountId: account._id,
            currency: account.currency,
            statusType: account.status,
            balance: balance
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to compute account balance: " + err.message,
            status: "failed"
        });
    }
}

// Controller to discover transfer destinations (counterparties)
async function getTransferDirectoryController(req, res) {
    try {
        const accounts = await accountModel.find({ status: "ACTIVE" }).populate("user", "name email");
        
        const directory = accounts
            .filter(acc => acc.user && acc.user._id.toString() !== req.user._id.toString())
            .map(acc => ({
                accountId: acc._id,
                holderName: acc.user.name,
                holderEmail: acc.user.email,
                currency: acc.currency
            }));

        res.status(200).json({
            status: "success",
            directory
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch directory: " + err.message,
            status: "failed"
        });
    }
}

module.exports = {
    createAccountController,
    getUserAccountsController,
    getAccountBalanceController,
    getTransferDirectoryController
};
