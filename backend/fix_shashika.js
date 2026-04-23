const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const User = require('./models/User');

async function fixRoles() {
  try {
    // Try with family: 4 to avoid IPv6 issues if that's the cause
    await mongoose.connect(process.env.MONGO_URI, { family: 4 });
    console.log('Connected to DB');
    const res = await User.updateMany({ name: /shashika/i }, { role: 'admin' });
    console.log('Update result:', res);
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err.message);
    process.exit(1);
  }
}

fixRoles();
