-- =====================================================
-- IT Literature Shop Database Setup Script
-- Compatible with Neon PostgreSQL
-- =====================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Create Tables
-- =====================================================

-- Users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "username" TEXT,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Genres table
CREATE TABLE IF NOT EXISTS "genres" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "genres_pkey" PRIMARY KEY ("id")
);

-- Books table
CREATE TABLE IF NOT EXISTS "books" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "title" TEXT NOT NULL,
    "writer" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "publication_year" INTEGER NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "stock_quantity" INTEGER NOT NULL,
    "genre_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "books_pkey" PRIMARY KEY ("id")
);

-- Orders table
CREATE TABLE IF NOT EXISTS "orders" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- Order Items table
CREATE TABLE IF NOT EXISTS "order_items" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "quantity" INTEGER NOT NULL,
    "order_id" UUID NOT NULL,
    "book_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- =====================================================
-- Create Indexes
-- =====================================================

-- Unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "genres_name_key" ON "genres"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "books_title_key" ON "books"("title");

-- Performance indexes
CREATE INDEX IF NOT EXISTS "idx_books_genre_id" ON "books"("genre_id");
CREATE INDEX IF NOT EXISTS "idx_books_publication_year" ON "books"("publication_year");
CREATE INDEX IF NOT EXISTS "idx_books_price" ON "books"("price");
CREATE INDEX IF NOT EXISTS "idx_orders_user_id" ON "orders"("user_id");
CREATE INDEX IF NOT EXISTS "idx_orders_created_at" ON "orders"("created_at");
CREATE INDEX IF NOT EXISTS "idx_order_items_order_id" ON "order_items"("order_id");
CREATE INDEX IF NOT EXISTS "idx_order_items_book_id" ON "order_items"("book_id");
CREATE INDEX IF NOT EXISTS "idx_genres_deleted_at" ON "genres"("deleted_at");
CREATE INDEX IF NOT EXISTS "idx_books_deleted_at" ON "books"("deleted_at");

-- =====================================================
-- Create Foreign Key Constraints
-- =====================================================

-- Books foreign key to genres
ALTER TABLE "books" 
ADD CONSTRAINT "books_genre_id_fkey" 
FOREIGN KEY ("genre_id") REFERENCES "genres"("id") 
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Orders foreign key to users
ALTER TABLE "orders" 
ADD CONSTRAINT "orders_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "users"("id") 
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Order items foreign key to orders
ALTER TABLE "order_items" 
ADD CONSTRAINT "order_items_order_id_fkey" 
FOREIGN KEY ("order_id") REFERENCES "orders"("id") 
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Order items foreign key to books
ALTER TABLE "order_items" 
ADD CONSTRAINT "order_items_book_id_fkey" 
FOREIGN KEY ("book_id") REFERENCES "books"("id") 
ON DELETE RESTRICT ON UPDATE CASCADE;

-- =====================================================
-- Create Functions and Triggers
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON "users" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_genres_updated_at 
    BEFORE UPDATE ON "genres" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at 
    BEFORE UPDATE ON "books" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON "orders" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at 
    BEFORE UPDATE ON "order_items" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Insert Sample Data (Optional)
-- =====================================================

-- Sample genres
INSERT INTO "genres" ("id", "name", "created_at", "updated_at") VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Programming', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440002', 'Web Development', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440003', 'Data Science', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440004', 'Mobile Development', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440005', 'DevOps', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Sample books
INSERT INTO "books" ("id", "title", "writer", "publisher", "publication_year", "description", "price", "stock_quantity", "genre_id", "created_at", "updated_at") VALUES
    ('650e8400-e29b-41d4-a716-446655440001', 'Clean Code', 'Robert C. Martin', 'Prentice Hall', 2008, 'A Handbook of Agile Software Craftsmanship', 45.99, 50, '550e8400-e29b-41d4-a716-446655440001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('650e8400-e29b-41d4-a716-446655440002', 'JavaScript: The Good Parts', 'Douglas Crockford', 'O''Reilly Media', 2008, 'The Good Parts of JavaScript and the Web', 29.99, 30, '550e8400-e29b-41d4-a716-446655440002', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('650e8400-e29b-41d4-a716-446655440003', 'Python for Data Analysis', 'Wes McKinney', 'O''Reilly Media', 2017, 'Data Wrangling with Pandas, NumPy, and IPython', 39.99, 25, '550e8400-e29b-41d4-a716-446655440003', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('650e8400-e29b-41d4-a716-446655440004', 'React Native in Action', 'Nader Dabit', 'Manning Publications', 2019, 'Building cross-platform mobile apps', 49.99, 20, '550e8400-e29b-41d4-a716-446655440004', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('650e8400-e29b-41d4-a716-446655440005', 'The Phoenix Project', 'Gene Kim', 'IT Revolution Press', 2013, 'A Novel About IT, DevOps, and Helping Your Business Win', 24.99, 40, '550e8400-e29b-41d4-a716-446655440005', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- =====================================================
-- Create Views (Optional)
-- =====================================================

-- View for books with genre information
CREATE OR REPLACE VIEW "books_with_genre" AS
SELECT 
    b.id,
    b.title,
    b.writer,
    b.publisher,
    b.publication_year,
    b.description,
    b.price,
    b.stock_quantity,
    b.created_at,
    b.updated_at,
    g.name as genre_name
FROM "books" b
LEFT JOIN "genres" g ON b.genre_id = g.id
WHERE b.deleted_at IS NULL;

-- View for order summary
CREATE OR REPLACE VIEW "order_summary" AS
SELECT 
    o.id as order_id,
    o.total,
    o.created_at as order_date,
    u.email as user_email,
    u.username,
    COUNT(oi.id) as total_items,
    SUM(oi.quantity) as total_quantity
FROM "orders" o
LEFT JOIN "users" u ON o.user_id = u.id
LEFT JOIN "order_items" oi ON o.id = oi.order_id
GROUP BY o.id, o.total, o.created_at, u.email, u.username;

-- =====================================================
-- Grant Permissions (Adjust based on your needs)
-- =====================================================

-- Grant necessary permissions to your application user
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- =====================================================
-- Database Setup Complete
-- =====================================================

-- Verify tables were created
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify indexes were created
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
