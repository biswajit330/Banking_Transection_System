
const mongoose = require("mongoose");

async function connectToDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("MONGO_URI is not defined in .env");
    return;
  }

  try {
    await mongoose.connect(uri);

    console.log("Connected to MongoDB successfully");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
  }
}

// Graceful cleanup
process.on("SIGTERM", async () => {
  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  } catch (err) {
    console.error("Error while disconnecting MongoDB:", err.message);
  }
});

process.on("SIGINT", async () => {
  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
    process.exit(0);
  } catch (err) {
    console.error("Error while disconnecting MongoDB:", err.message);
    process.exit(1);
  }
});

module.exports = connectToDB;

