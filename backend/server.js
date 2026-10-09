require("dotenv").config();
const connectToDB = require("./src/config/db");
const seedInitialData = require("./src/config/seed");
const app = require("./src/app");

const PORT = 3000;

async function bootstrap() {
  try {
    await connectToDB();
    await seedInitialData();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`LedgerPay server is running on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to bootstrap server:", err);
    process.exit(1);
  }
}

bootstrap();
