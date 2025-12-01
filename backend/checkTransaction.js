const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');
    
    const Contract = mongoose.model('Contract', new mongoose.Schema({}, { strict: false }));
    const EscrowTransaction = mongoose.model('EscrowTransaction', new mongoose.Schema({}, { strict: false }));
    
    const contract = await Contract.findOne().sort({ createdAt: -1 });
    console.log('Contract transactionId:', contract.transactionId);
    
    const transaction = await EscrowTransaction.findById(contract.transactionId);
    console.log('Transaction:', JSON.stringify(transaction, null, 2));
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

check();
