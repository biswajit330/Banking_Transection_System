
const userModel = require("../models/user.model");
const accountModel = require("../models/account.model");
const ledgerModel = require("../models/ledger.model");
const transactionModel = require("../models/transaction.model");

async function seedInitialData() {
  try {
    // 1. Seed System Treasury User
    let systemUser = await userModel.findOne({ email: "system@ledgerpay.internal" }).select("+systemUser");
    if (!systemUser) {
      systemUser = await userModel.create({
        name: "Ledger Treasury System",
        email: "system@ledgerpay.internal",
        password: "SystemSecurePassword123!",
        systemUser: true
      });
      console.log("Seeded System User:", systemUser.email);
    }

    // 2. Seed System Treasury Account
    let systemAccount = await accountModel.findOne({ user: systemUser._id });
    if (!systemAccount) {
      systemAccount = await accountModel.create({
        user: systemUser._id,
        currency: "INR",
        status: "ACTIVE"
      });
      console.log("Seeded System Treasury Account:", systemAccount._id.toString());
    }

    // Ensure System Treasury has Authorized Capital Reserve (₹10,00,00,000 / ₹10 Crore)
    const existingSystemCredit = await ledgerModel.findOne({
      account: systemAccount._id,
      type: "CREDIT"
    });

    if (!existingSystemCredit) {
      const capitalTx = await transactionModel.create({
        fromAccount: systemAccount._id,
        toAccount: systemAccount._id,
        amount: 100000000,
        idempotencyKey: `treasury-capital-seed-init`,
        status: "COMPLETED"
      });

      await ledgerModel.create({
        account: systemAccount._id,
        amount: 100000000,
        transaction: capitalTx._id,
        type: "CREDIT"
      });
      console.log("Seeded System Treasury Account with ₹10,00,00,000 (₹10 Crore) authorized capital reserve");
    }

    // 3. Seed Demo User for instant testability
    let demoUser = await userModel.findOne({ email: "alex@example.com" });
    if (!demoUser) {
      demoUser = await userModel.create({
        name: "Alex Mercer",
        email: "alex@example.com",
        password: "Password123!"
      });
      console.log("Seeded Demo User:", demoUser.email);

      // Create primary checking account for demo user in INR
      const demoAccount = await accountModel.create({
        user: demoUser._id,
        currency: "INR",
        status: "ACTIVE"
      });

      // Initial funding of ₹50,000 for demo user
      const initTx = await transactionModel.create({
        fromAccount: systemAccount._id,
        toAccount: demoAccount._id,
        amount: 50000,
        idempotencyKey: `seed-init-${Date.now()}`,
        status: "COMPLETED"
      });

      await ledgerModel.create([
        {
          account: systemAccount._id,
          amount: 50000,
          transaction: initTx._id,
          type: "DEBIT"
        },
        {
          account: demoAccount._id,
          amount: 50000,
          transaction: initTx._id,
          type: "CREDIT"
        }
      ]);
      console.log("Seeded Demo Account with ₹50,000 initial balance");
    }

    // 4. Seed Secondary Counterparty User
    let counterpartyUser = await userModel.findOne({ email: "sarah@example.com" });
    if (!counterpartyUser) {
      counterpartyUser = await userModel.create({
        name: "Sarah Jenkins",
        email: "sarah@example.com",
        password: "Password123!"
      });

      const sarahAccount = await accountModel.create({
        user: counterpartyUser._id,
        currency: "INR",
        status: "ACTIVE"
      });

      const sarahTx = await transactionModel.create({
        fromAccount: systemAccount._id,
        toAccount: sarahAccount._id,
        amount: 25000,
        idempotencyKey: `seed-sarah-${Date.now()}`,
        status: "COMPLETED"
      });

      await ledgerModel.create([
        {
          account: systemAccount._id,
          amount: 25000,
          transaction: sarahTx._id,
          type: "DEBIT"
        },
        {
          account: sarahAccount._id,
          amount: 25000,
          transaction: sarahTx._id,
          type: "CREDIT"
        }
      ]);
      console.log("Seeded Sarah Account with ₹25,000 initial balance");
    }
  } catch (error) {
    console.error("Error running database seed:", error.message);
  }
}

module.exports = seedInitialData;

