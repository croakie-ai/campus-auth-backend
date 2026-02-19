const cron = require("node-cron");
const User = require("../models/User");

cron.schedule("*/5 * * * *", async () => {

  try {

    const result = await User.deleteMany({
      isVerified: false,
      otpExpires: { $lt: Date.now() }
    });

    if (result.deletedCount > 0) {
      console.log(`Deleted ${result.deletedCount} unverified users`);
    }

  } catch (error) {
    console.log("Cleanup error:", error);
  }

});
