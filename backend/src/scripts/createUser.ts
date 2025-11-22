import { createClient } from "@supabase/supabase-js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const mongoUri = process.env.MONGO_URI;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

if (!mongoUri) {
  console.error("❌ Missing MongoDB URI");
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface CreateUserOptions {
  email: string;
  password: string;
  role: "investor" | "seller" | "admin";
  name?: string;
  emailConfirmed?: boolean;
}

async function createVerifiedUser(options: CreateUserOptions) {
  const { email, password, role, name = "", emailConfirmed = true } = options;

  try {
    console.log(`\n🚀 Creating user: ${email} with role: ${role}`);

    // 1. Create user in Supabase
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: emailConfirmed,
        user_metadata: {
          role,
          name,
          full_name: name,
        },
      });

    if (authError) {
      throw new Error(`Supabase error: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error("Failed to create user in Supabase");
    }

    console.log(`✅ Created user in Supabase (ID: ${authData.user.id})`);

    // 2. Connect to MongoDB
    await mongoose.connect(mongoUri!);
    console.log(`✅ Connected to MongoDB`);

    // 3. Create user in MongoDB
    const dbUser = await User.create({
      supabaseId: authData.user.id,
      email,
      role,
      profile: {
        name,
      },
    });

    console.log(`✅ Created user in MongoDB (ID: ${dbUser._id})`);

    // 4. Disconnect from MongoDB
    await mongoose.disconnect();
    console.log(`✅ Disconnected from MongoDB`);

    console.log(`\n✨ User created successfully!`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${role}`);
    console.log(`   Verified: ${emailConfirmed ? "Yes" : "No"}`);
    console.log(`   Supabase ID: ${authData.user.id}`);
    console.log(`   MongoDB ID: ${dbUser._id}`);

    return {
      supabaseUser: authData.user,
      mongoUser: dbUser,
    };
  } catch (error: any) {
    console.error(`\n❌ Error creating user:`, error.message);
    await mongoose.disconnect();
    throw error;
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

function printUsage() {
  console.log(`
📖 Usage: npm run create-user -- [options]

Options:
  --email <email>        User email (required)
  --password <password>  User password (required)
  --role <role>          User role: investor, seller, or admin (required)
  --name <name>          User's full name (optional)
  --unverified           Create unverified user (default: verified)

Examples:
  # Create a verified investor
  npm run create-user -- --email investor@test.com --password Test123! --role investor --name "John Investor"

  # Create a verified seller
  npm run create-user -- --email seller@test.com --password Test123! --role seller --name "Jane Seller"

  # Create an admin
  npm run create-user -- --email admin@test.com --password Admin123! --role admin --name "Admin User"

  # Create an unverified user
  npm run create-user -- --email test@test.com --password Test123! --role investor --unverified
  `);
}

// Parse arguments
function parseArgs() {
  const options: Partial<CreateUserOptions> = {
    emailConfirmed: true,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--email":
        options.email = args[++i];
        break;
      case "--password":
        options.password = args[++i];
        break;
      case "--role":
        const role = args[++i];
        if (!["investor", "seller", "admin"].includes(role)) {
          console.error(
            `❌ Invalid role: ${role}. Must be investor, seller, or admin`
          );
          process.exit(1);
        }
        options.role = role as "investor" | "seller" | "admin";
        break;
      case "--name":
        options.name = args[++i];
        break;
      case "--unverified":
        options.emailConfirmed = false;
        break;
      case "--help":
      case "-h":
        printUsage();
        process.exit(0);
        break;
      default:
        console.error(`❌ Unknown option: ${args[i]}`);
        printUsage();
        process.exit(1);
    }
  }

  return options;
}

// Main execution
async function main() {
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printUsage();
    process.exit(0);
  }

  const options = parseArgs();

  // Validate required fields
  if (!options.email || !options.password || !options.role) {
    console.error(
      "❌ Missing required arguments: --email, --password, and --role are required\n"
    );
    printUsage();
    process.exit(1);
  }

  await createVerifiedUser(options as CreateUserOptions);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
