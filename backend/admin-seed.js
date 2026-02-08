const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@kamp.com' });
    if (adminExists) {
      console.log('Admin user already exists with email: admin@kamp.com');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create admin user
    const admin = new User({
      name: 'KAMP Admin',
      email: 'admin@kamp.com',
      password: 'Admin@123456', // Change this to a secure password
      type: 'Admin',
    });

    await admin.save();
    console.log('✓ Admin user created successfully!');
    console.log('Email: admin@kamp.com');
    console.log('Password: Admin@123456');
    console.log('\n⚠️  IMPORTANT: Change this password in production!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
};

seedAdmin();
