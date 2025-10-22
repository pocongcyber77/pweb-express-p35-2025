# Setup Instructions

## 1. Install Dependencies
```bash
npm install
```

## 2. Setup Environment Variables
Copy `.env.example` to `.env` and update with your actual values:

```bash
cp .env.example .env
```

Edit `.env` file:
```env
DATABASE_URL="postgresql://<username>:<password>@<neon-host>/<dbname>?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3000
```

## 3. Setup Database
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

## 4. Start Development Server
```bash
npm run dev
```

Server will be available at `http://localhost:3000`

## 5. Test API
- Health check: `GET http://localhost:3000/health`
- API Documentation: See README.md for all endpoints

## Database Schema
The database will be automatically created with the following tables:
- `users` - User accounts
- `genres` - Book genres
- `books` - Book catalog
- `transactions` - Purchase transactions
- `transaction_items` - Individual items in transactions

## API Endpoints Overview
- **Authentication**: `/auth/*`
- **Books**: `/books/*`
- **Genres**: `/genre/*`
- **Transactions**: `/transactions/*`

All endpoints except `/auth` require JWT authentication.
