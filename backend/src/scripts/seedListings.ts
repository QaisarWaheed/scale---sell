import mongoose from "mongoose";
import Listing from "../models/Listing";
import dotenv from "dotenv";

dotenv.config();

const sampleListings = [
  {
    title: "Profitable E-Commerce Fashion Store",
    description:
      "Established online fashion boutique with loyal customer base, dropshipping model, and strong social media presence. Fully automated fulfillment process.",
    category: "E-Commerce",
    location: "New York, NY",
    financials: {
      askingPrice: 450000,
      revenue: 850000,
      profit: 180000,
      ebitda: 200000,
    },
    details: {
      yearEstablished: 2019,
      employees: 5,
      website: "https://example-fashion.com",
      reasonForSelling: "Moving to different venture",
    },
    status: "approved",
    seller: "000000000000000000000001", // Placeholder seller ID
    images: [],
  },
  {
    title: "SaaS Project Management Platform",
    description:
      "Cloud-based project management tool with 2,000+ active subscribers. Strong MRR growth, low churn rate, and scalable infrastructure.",
    category: "SaaS",
    location: "San Francisco, CA",
    financials: {
      askingPrice: 1200000,
      revenue: 720000,
      profit: 420000,
      ebitda: 450000,
    },
    details: {
      yearEstablished: 2020,
      employees: 8,
      website: "https://example-saas.com",
      reasonForSelling: "Founder retirement",
    },
    status: "approved",
    seller: "000000000000000000000002",
    images: [],
  },
  {
    title: "Organic Coffee Roastery & Café",
    description:
      "Popular local coffee shop and roastery with wholesale contracts. Prime downtown location, loyal customer base, and growth potential.",
    category: "Food & Beverage",
    location: "Portland, OR",
    financials: {
      askingPrice: 350000,
      revenue: 480000,
      profit: 95000,
      ebitda: 110000,
    },
    details: {
      yearEstablished: 2018,
      employees: 12,
      website: "https://example-coffee.com",
      reasonForSelling: "Relocation",
    },
    status: "approved",
    seller: "000000000000000000000003",
    images: [],
  },
  {
    title: "Digital Marketing Agency",
    description:
      "Full-service digital marketing agency specializing in SEO, PPC, and social media management. 25+ active clients with recurring contracts.",
    category: "Services",
    location: "Austin, TX",
    financials: {
      askingPrice: 650000,
      revenue: 980000,
      profit: 325000,
      ebitda: 350000,
    },
    details: {
      yearEstablished: 2017,
      employees: 15,
      website: "https://example-agency.com",
      reasonForSelling: "Partnership dissolution",
    },
    status: "approved",
    seller: "000000000000000000000004",
    images: [],
  },
  {
    title: "Mobile App Development Studio",
    description:
      "Boutique mobile app development company with strong portfolio of iOS and Android apps. Recurring revenue from maintenance contracts.",
    category: "Technology",
    location: "Seattle, WA",
    financials: {
      askingPrice: 890000,
      revenue: 1200000,
      profit: 380000,
      ebitda: 420000,
    },
    details: {
      yearEstablished: 2016,
      employees: 10,
      website: "https://example-apps.com",
      reasonForSelling: "Pursuing new opportunities",
    },
    status: "approved",
    seller: "000000000000000000000005",
    images: [],
  },
  {
    title: "Fitness & Wellness Center",
    description:
      "Modern fitness center with yoga, pilates, and personal training services. 400+ active members, excellent equipment, and prime location.",
    category: "Health & Fitness",
    location: "Miami, FL",
    financials: {
      askingPrice: 520000,
      revenue: 625000,
      profit: 145000,
      ebitda: 165000,
    },
    details: {
      yearEstablished: 2019,
      employees: 18,
      website: "https://example-fitness.com",
      reasonForSelling: "Owner health reasons",
    },
    status: "approved",
    seller: "000000000000000000000006",
    images: [],
  },
];

async function seedListings() {
  try {
    // Connect to MongoDB
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/scale-sell-hub";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    // Clear existing listings (optional - comment out if you want to keep existing)
    await Listing.deleteMany({});
    console.log("Cleared existing listings");

    // Insert sample listings
    const result = await Listing.insertMany(sampleListings);
    console.log(`Successfully seeded ${result.length} listings`);

    // Disconnect
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error seeding listings:", error);
    process.exit(1);
  }
}

seedListings();
