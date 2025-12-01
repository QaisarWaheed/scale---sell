const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function updatePhones() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    // Update buyer
    const buyer = await User.findOneAndUpdate(
      { email: 'azibaliansari311@gmail.com' },
      { $set: { 'profile.phone': '+92 300 1234567' } },
      { new: true }
    );
    
    // Update seller
    const seller = await User.findOneAndUpdate(
      { email: 'wasifzahoor296@gmail.com' },
      { $set: { 'profile.phone': '+92 321 7654321' } },
      { new: true }
    );
    
    console.log('\n✅ Updated buyer phone:', buyer?.profile?.phone);
    console.log('✅ Updated seller phone:', seller?.profile?.phone);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updatePhones();
