# 📚 IT Literature Shop API

Backend API untuk sistem toko buku literatur IT yang dibangun dengan Express.js, TypeScript, Prisma ORM, dan PostgreSQL (Neon).

## 📋 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Struktur Repository](#-struktur-repository)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Setup & Installation](#-setup--installation)
- [Development](#-development)
- [Testing](#-testing)
- [Build & Deploy](#-build--deploy)
- [Postman Collection](#-postman-collection)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

## 🎯 Tentang Proyek

IT Literature Shop API adalah backend service untuk sistem e-commerce toko buku literatur IT. API ini menyediakan fitur-fitur lengkap untuk manajemen:

- **Authentication & Authorization** - JWT-based auth system
- **Books Management** - CRUD operations untuk buku
- **Genres Management** - Kategori buku
- **Transactions** - Sistem transaksi dan order
- **User Management** - Manajemen pengguna

### Fitur Utama

- ✅ **RESTful API** dengan standar HTTP methods
- ✅ **JWT Authentication** untuk keamanan
- ✅ **Database ORM** dengan Prisma
- ✅ **Input Validation** dengan Zod
- ✅ **Error Handling** yang comprehensive
- ✅ **Pagination** untuk performa optimal
- ✅ **Soft Delete** untuk data integrity
- ✅ **TypeScript** untuk type safety
- ✅ **PostgreSQL** dengan Neon cloud database

## 🛠 Teknologi yang Digunakan

### Backend Framework
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript

### Database & ORM
- **PostgreSQL** - Relational database
- **Neon** - Cloud PostgreSQL provider
- **Prisma** - Modern ORM

### Authentication & Security
- **JWT** - JSON Web Tokens
- **bcrypt** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

### Validation & Utilities
- **Zod** - Schema validation
- **dotenv** - Environment variables

### Development Tools
- **ts-node-dev** - Development server
- **TypeScript** - Compiler
- **Postman** - API testing

## 📁 Struktur Repository

```
pweb-express-p35-2025/
├── 📁 src/                          # Source code
│   ├── 📁 controllers/              # Request handlers
│   │   ├── auth.controller.ts       # Authentication logic
│   │   ├── books.controller.ts      # Books management
│   │   ├── genre.controller.ts      # Genres management
│   │   └── transactions.controller.ts # Transactions logic
│   ├── 📁 services/                 # Business logic
│   │   ├── auth.service.ts          # Auth business logic
│   │   ├── books.service.ts         # Books business logic
│   │   ├── genre.service.ts         # Genres business logic
│   │   └── transactions.service.ts  # Transactions business logic
│   ├── 📁 routes/                   # API routes
│   │   ├── auth.routes.ts           # Auth endpoints
│   │   ├── books.routes.ts          # Books endpoints
│   │   ├── genre.routes.ts          # Genres endpoints
│   │   └── transactions.routes.ts   # Transactions endpoints
│   ├── 📁 middlewares/              # Custom middlewares
│   │   ├── auth.middleware.ts       # JWT authentication
│   │   └── error.middleware.ts      # Error handling
│   ├── 📁 utils/                    # Utility functions
│   │   ├── jwt.ts                   # JWT utilities
│   │   ├── pagination.ts            # Pagination helpers
│   │   └── validators.ts            # Zod schemas
│   ├── 📁 prisma/                   # Database client
│   │   └── client.ts                # Prisma client instance
│   ├── app.ts                       # Express app configuration
│   └── server.ts                    # Server entry point
├── 📁 prisma/                       # Database schema & migrations
│   ├── 📁 migrations/               # Database migrations
│   └── schema.prisma                # Prisma schema
├── 📁 dist/                         # Compiled JavaScript (build output)
├── 📄 package.json                  # Dependencies & scripts
├── 📄 tsconfig.json                 # TypeScript configuration
├── 📄 .env                          # Environment variables
├── 📄 env.example                   # Environment template
├── 📄 database-setup.sql            # Database setup script
├── 📄 NEON_SETUP.md                 # Neon database setup guide
├── 📄 IT-Literature-Shop-API.postman_collection.json # Postman collection
├── 📄 import-postman.json           # Alternative Postman collection
├── 📄 test-api.sh                   # API testing script
├── 📄 test-complete-api.sh          # Complete API test script
├── 📄 simple-test.sh                # Simple test script
├── 📄 start.sh                      # Production start script
└── 📄 README.md                     # This file
```

## 🗄 Database Schema

### Tables

#### 1. **users** - Data pengguna
```sql
- id (UUID, Primary Key)
- username (String, Optional)
- password (String, Required)
- email (String, Unique)
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### 2. **genres** - Kategori buku
```sql
- id (UUID, Primary Key)
- name (String, Unique)
- created_at (Timestamp)
- updated_at (Timestamp)
- deleted_at (Timestamp, Optional - Soft Delete)
```

#### 3. **books** - Data buku
```sql
- id (UUID, Primary Key)
- title (String, Unique)
- writer (String)
- publisher (String)
- publication_year (Integer)
- description (String, Optional)
- price (Decimal 10,2)
- stock_quantity (Integer)
- genre_id (UUID, Foreign Key)
- created_at (Timestamp)
- updated_at (Timestamp)
- deleted_at (Timestamp, Optional - Soft Delete)
```

#### 4. **orders** - Data pesanan
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- total (Decimal 10,2)
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### 5. **order_items** - Item dalam pesanan
```sql
- id (UUID, Primary Key)
- quantity (Integer)
- order_id (UUID, Foreign Key)
- book_id (UUID, Foreign Key)
- created_at (Timestamp)
- updated_at (Timestamp)
```

### Relationships
- `books` → `genres` (Many-to-One)
- `orders` → `users` (Many-to-One)
- `order_items` → `orders` (Many-to-One)
- `order_items` → `books` (Many-to-One)

## 🚀 API Endpoints

### Base URL
```
http://localhost:3000
```

### Response Format
```json
{
  "success": true | false,
  "message": "string",
  "data": {} | [] | undefined
}
```

### 1. **Health Check**
- **GET** `/` - Welcome message
- **GET** `/health` - Server health status

### 2. **Authentication** (`/auth`)
- **POST** `/auth/register` - Register user baru
- **POST** `/auth/login` - Login user
- **GET** `/auth/me` - Get current user profile

### 3. **Genres** (`/genre`)
- **POST** `/genre` - Create genre (Auth required)
- **GET** `/genre` - Get all genres (with pagination & search)
- **GET** `/genre/:id` - Get genre by ID
- **PATCH** `/genre/:id` - Update genre (Auth required)
- **DELETE** `/genre/:id` - Soft delete genre (Auth required)

### 4. **Books** (`/books`)
- **POST** `/books` - Create book (Auth required)
- **GET** `/books` - Get all books (with pagination, search, filter)
- **GET** `/books/:id` - Get book by ID
- **GET** `/books/genre/:id` - Get books by genre
- **PATCH** `/books/:id` - Update book (Auth required)
- **DELETE** `/books/:id` - Soft delete book (Auth required)

### 5. **Transactions** (`/transactions`)
- **POST** `/transactions` - Create transaction (Auth required)
- **GET** `/transactions` - Get all transactions (with pagination)
- **GET** `/transactions/:id` - Get transaction by ID
- **GET** `/transactions/statistics` - Get transaction statistics

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- npm atau yarn
- PostgreSQL database (Neon recommended)

### 1. Clone Repository
```bash
git clone <repository-url>
cd pweb-express-p35-2025
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
# Copy environment template
cp env.example .env

# Edit .env file with your configuration
nano .env
```

### 4. Database Setup

#### Option A: Using Prisma Migrate (Recommended)
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate
```

#### Option B: Using SQL Script
```bash
# Run database setup script
psql "your-connection-string" -f database-setup.sql
```

### 5. Start Development Server
```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload

# Database
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio

# Build & Production
npm run build        # Build TypeScript to JavaScript
npm start           # Start production server
```

### Development Workflow

1. **Start development server**
   ```bash
   npm run dev
   ```

2. **Database changes**
   ```bash
   # Edit prisma/schema.prisma
   npm run db:migrate
   npm run db:generate
   ```

3. **Test API endpoints**
   - Use Postman collection
   - Or use provided test scripts

### Code Structure

#### Controllers
Handle HTTP requests and responses, validate input, call services.

#### Services
Contain business logic, database operations, data processing.

#### Routes
Define API endpoints and connect them to controllers.

#### Middlewares
Handle cross-cutting concerns like authentication, error handling.

#### Utils
Reusable utility functions and validation schemas.

## 🧪 Testing

### Manual Testing

#### 1. Using Postman
1. Import `IT-Literature-Shop-API.postman_collection.json`
2. Set environment variables:
   - `BASE_URL`: `http://localhost:3000`
   - `JWT`: (will be set after login)
3. Run collection tests

#### 2. Using Test Scripts
```bash
# Simple API test
./simple-test.sh

# Complete API test
./test-complete-api.sh

# Individual API test
./test-api.sh
```

#### 3. Using cURL
```bash
# Health check
curl http://localhost:3000/health

# Root endpoint
curl http://localhost:3000/
```

### Test Flow
1. **Health Check** - Verify server is running
2. **Register/Login** - Get JWT token
3. **Test Protected Endpoints** - Use token for authenticated requests
4. **Test CRUD Operations** - Create, read, update, delete data
5. **Test Error Cases** - Invalid data, unauthorized access, etc.

## 🏗 Build & Deploy

### Build for Production
```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Build Output
- Compiled JavaScript files in `dist/` directory
- TypeScript declaration files
- Source maps for debugging

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=your-production-database-url
DIRECT_URL=your-production-direct-url
JWT_SECRET=your-secure-jwt-secret
```

## 📮 Postman Collection

### Collection Files
- `IT-Literature-Shop-API.postman_collection.json` - Main collection
- `import-postman.json` - Alternative collection format

### Environment Variables
- `BASE_URL`: `http://localhost:3000`
- `JWT`: JWT token (set after login)

### Collection Structure
- **Health Check** - Server status
- **Auth** - Authentication endpoints
- **Genres** - Genre management
- **Books** - Book management
- **Transactions** - Transaction management

### Using Postman
1. Import collection
2. Set environment variables
3. Run requests in order
4. Use pre-request scripts for dynamic data
5. Add tests for automated validation

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Find process using port 3000
lsof -ti:3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

#### 2. Database Connection Error
```bash
# Check database URL in .env
# Verify database is running
# Test connection with Prisma Studio
npm run db:studio
```

#### 3. JWT Token Issues
- Ensure JWT_SECRET is set in .env
- Check token expiration
- Verify token format in Authorization header

#### 4. Prisma Client Error
```bash
# Regenerate Prisma client
npm run db:generate

# Reset database (development only)
npx prisma migrate reset
```

#### 5. TypeScript Compilation Error
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Clean and rebuild
rm -rf dist/
npm run build
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Or with specific debug namespace
DEBUG=app:* npm run dev
```

### Logs
- Server logs in console
- Database queries in Prisma Studio
- Error details in response body

## 🤝 Contributing

### Development Guidelines
1. Follow TypeScript best practices
2. Use meaningful commit messages
3. Test all changes thoroughly
4. Update documentation as needed
5. Follow existing code style

### Code Style
- Use TypeScript strict mode
- Implement proper error handling
- Add input validation
- Use async/await for promises
- Follow RESTful API conventions

### Pull Request Process
1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Binu & Ni'mah** - *praktikum asoy kami surrend aja deh*

## 🙏 Acknowledgments

- Express.js community
- Prisma team
- Neon database
- TypeScript team
- All contributors

---




---

**KAMI NAK TIDOOOOOO! 🚀**