const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    const buyer = await User.findOne({ email: 'azibaliansari311@gmail.com' });
    const seller = await User.findOne({ email: 'wasifzahoor296@gmail.com' });
    
    console.log('\n=== BUYER ===');
    console.log('Name:', buyer?.profile?.name);
    console.log('Phone:', buyer?.profile?.phone);
    console.log('Email:', buyer?.email);
    console.log('Full profile:', JSON.stringify(buyer?.profile, null, 2));
    
    console.log('\n=== SELLER ===');
    console.log('Name:', seller?.profile?.name);
    console.log('Phone:', seller?.profile?.phone);
    console.log('Email:', seller?.email);
    console.log('Full profile:', JSON.stringify(seller?.profile, null, 2));
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
