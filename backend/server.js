const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/data', require('./routes/data'));

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/data-management'
    );

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Seed default admin if no users exist
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('No users found in the database. Seeding a default admin user...');
      const defaultAdmin = new User({
        email: 'admin@rosterra.com',
        password: 'adminpassword123',
        role: 'admin'
      });
      await defaultAdmin.save();
      console.log('Default admin user seeded successfully:');
      console.log('  Email: admin@rosterra.com');
      console.log('  Password: adminpassword123');
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


