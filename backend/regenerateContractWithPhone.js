const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function regenerateContract() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');
    
    // Define models
    const Contract = mongoose.model('Contract', new mongoose.Schema({}, { strict: false }));
    const EscrowTransaction = mongoose.model('EscrowTransaction', new mongoose.Schema({}, { strict: false }));
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const Listing = mongoose.model('Listing', new mongoose.Schema({}, { strict: false }));
    
    // Get latest contract
    const contract = await Contract.findOne().sort({ createdAt: -1 });
    if (!contract) {
      console.log('No contract found');
      process.exit(1);
    }
    
    console.log('Found contract:', contract._id);
    
    // Get transaction
    const transaction = await EscrowTransaction.findById(contract.transactionId);
    if (!transaction) {
      console.log('Transaction not found');
      process.exit(1);
    }
    
    // Get buyer, seller, and listing (using businessId field)
    const buyer = await User.findById(transaction.buyerId);
    const seller = await User.findById(transaction.sellerId);
    const listing = await Listing.findById(transaction.businessId);
    
    if (!listing) {
      console.log('Listing not found with businessId:', transaction.businessId);
      process.exit(1);
    }
    
    console.log('Buyer:', buyer.profile.name, '- Phone:', buyer.profile.phone);
    console.log('Seller:', seller.profile.name, '- Phone:', seller.profile.phone);
    console.log('Listing:', listing.title);
    console.log('\nRegenerating PDF...\n');
    
    // Import PDF service
    const { generateContractPDF } = require('./dist/services/pdfService');
    
    // Generate new PDF
    const pdfUrl = await generateContractPDF(transaction, buyer, seller, listing);
    
    // Update contract with new PDF URL
    contract.pdfUrl = pdfUrl;
    await contract.save();
    
    console.log('✅ Contract PDF regenerated successfully!');
    console.log('New PDF URL:', pdfUrl);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

regenerateContract();
