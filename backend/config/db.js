// Handles the single MongoDB connection for the whole app.
// We call this once at startup — mongoose reuses the connection everywhere else.
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Hard exit — there's no point running without a database
    process.exit(1);
  }
};

module.exports = connectDB;
