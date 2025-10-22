#!/bin/bash

echo "🚀 Starting IT Literature Shop Backend Setup..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update .env with your actual database credentials!"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env file with your Neon database URL"
echo "2. Run: npx prisma migrate dev --name init"
echo "3. Start server: npm run dev"
echo ""
echo "🔗 Server will be available at: http://localhost:3000"
echo "📚 Health check: http://localhost:3000/health"
