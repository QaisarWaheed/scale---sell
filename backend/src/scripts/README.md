# User Creation Script

This script allows you to create verified users with any role (investor, seller, or admin) for testing and development purposes.

## Prerequisites

- Backend server environment variables configured (`.env` file)
- MongoDB running and accessible
- Supabase project configured

## Usage

```bash
npm run create-user -- [options]
```

### Options

| Option         | Description            | Required | Values                        |
| -------------- | ---------------------- | -------- | ----------------------------- |
| `--email`      | User email address     | ✅ Yes   | Any valid email               |
| `--password`   | User password          | ✅ Yes   | Min 6 characters              |
| `--role`       | User role              | ✅ Yes   | `investor`, `seller`, `admin` |
| `--name`       | User's full name       | ❌ No    | Any string                    |
| `--unverified` | Create unverified user | ❌ No    | Flag (no value)               |

## Examples

### Create a Verified Investor

```bash
npm run create-user -- --email investor@test.com --password Test123! --role investor --name "John Investor"
```

### Create a Verified Seller

```bash
npm run create-user -- --email seller@test.com --password Test123! --role seller --name "Jane Seller"
```

### Create an Admin User

```bash
npm run create-user -- --email admin@test.com --password Admin123! --role admin --name "Admin User"
```

### Create an Unverified User

```bash
npm run create-user -- --email test@test.com --password Test123! --role investor --unverified
```

## What the Script Does

1. **Creates user in Supabase** using the Admin API

   - Sets email and password
   - Marks email as verified (unless `--unverified` flag is used)
   - Stores role and name in user metadata

2. **Creates user in MongoDB**

   - Syncs user data from Supabase
   - Stores role and profile information
   - Links to Supabase user via `supabaseId`

3. **Outputs user details**
   - Displays created user information
   - Shows both Supabase ID and MongoDB ID
   - Confirms verification status

## Output Example

```
🚀 Creating user: investor@test.com with role: investor
✅ Created user in Supabase (ID: abc123...)
✅ Connected to MongoDB
✅ Created user in MongoDB (ID: 507f1f77bcf86cd799439011)
✅ Disconnected from MongoDB

✨ User created successfully!
   Email: investor@test.com
   Password: Test123!
   Role: investor
   Verified: Yes
   Supabase ID: abc123...
   MongoDB ID: 507f1f77bcf86cd799439011
```

## Common Use Cases

### Testing Role-Based Access

```bash
# Create users for each role
npm run create-user -- --email investor@test.com --password Test123! --role investor
npm run create-user -- --email seller@test.com --password Test123! --role seller
npm run create-user -- --email admin@test.com --password Test123! --role admin
```

### Quick Test User

```bash
npm run create-user -- --email test@test.com --password test123 --role investor
```

### Demo Accounts

```bash
npm run create-user -- --email demo.investor@scaleandsell.com --password Demo2024! --role investor --name "Demo Investor"
npm run create-user -- --email demo.seller@scaleandsell.com --password Demo2024! --role seller --name "Demo Seller"
```

## Troubleshooting

### Error: Missing Supabase environment variables

- Ensure `.env` file exists in the backend directory
- Check that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set

### Error: Missing MongoDB URI

- Ensure `MONGO_URI` is set in `.env` file
- Verify MongoDB is running and accessible

### Error: User already exists

- The email is already registered in Supabase
- Use a different email address

## Security Notes

⚠️ **Important**: This script uses the Supabase Service Role Key which has admin privileges. Only use this script in development/testing environments.

- Never commit the `.env` file to version control
- Keep the service role key secure
- Don't use this script in production for regular user registration
- For production, use the normal signup flow through the frontend

## Related Files

- Script: [`backend/src/scripts/createUser.ts`](file:///c:/Users/Anas/Desktop/scale-sell-hub/backend/src/scripts/createUser.ts)
- User Model: [`backend/src/models/User.ts`](file:///c:/Users/Anas/Desktop/scale-sell-hub/backend/src/models/User.ts)
- Auth Middleware: [`backend/src/middleware/auth.ts`](file:///c:/Users/Anas/Desktop/scale-sell-hub/backend/src/middleware/auth.ts)
