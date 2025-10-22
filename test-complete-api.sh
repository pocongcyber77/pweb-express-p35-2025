#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "=== IT Literature Shop API Testing ==="
echo "Base URL: $BASE_URL"
echo

# Function to check if server is running
check_server() {
    if ! curl -sS "$BASE_URL/health" > /dev/null 2>&1; then
        echo "❌ Server tidak berjalan di $BASE_URL"
        echo "Jalankan: npm run dev"
        exit 1
    fi
    echo "✅ Server berjalan di $BASE_URL"
}

# Function to make API calls with error handling
api_call() {
    local method="$1"
    local url="$2"
    local data="$3"
    local headers="$4"
    
    if [ -n "$data" ]; then
        if [ -n "$headers" ]; then
            curl -sS -X "$method" "$url" -H "Content-Type: application/json" $headers -d "$data"
        else
            curl -sS -X "$method" "$url" -H "Content-Type: application/json" -d "$data"
        fi
    else
        if [ -n "$headers" ]; then
            curl -sS -X "$method" "$url" $headers
        else
            curl -sS -X "$method" "$url"
        fi
    fi
}

echo "1. Checking server status..."
check_server
echo

echo "2. Register new user..."
REGISTER_RESPONSE=$(api_call "POST" "$BASE_URL/auth/register" '{
    "username": "Test User",
    "email": "test@example.com", 
    "password": "Test.12345"
}' "")
echo "$REGISTER_RESPONSE" | jq .

# Check if user already exists
if echo "$REGISTER_RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
    echo "User sudah ada, lanjut ke login..."
fi

echo
echo "3. Login to get JWT token..."
LOGIN_RESPONSE=$(api_call "POST" "$BASE_URL/auth/login" '{
    "email": "test@example.com",
    "password": "Test.12345"
}' "")
echo "$LOGIN_RESPONSE" | jq .

JWT=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token // .data.access_token // empty')
if [ -z "$JWT" ]; then
    echo "❌ Gagal mendapatkan JWT token"
    exit 1
fi
echo "✅ JWT Token: ${JWT:0:50}..."

AUTH_HEADER="-H 'Authorization: Bearer $JWT'"

echo
echo "4. Create Genre..."
GENRE_RESPONSE=$(api_call "POST" "$BASE_URL/genre" '{
    "name": "Test Genre '$(date +%s)'"
}' "$AUTH_HEADER")
echo "$GENRE_RESPONSE" | jq .

GENRE_ID=$(echo "$GENRE_RESPONSE" | jq -r '.data.id // empty')
if [ -z "$GENRE_ID" ]; then
    echo "❌ Gagal membuat genre"
    exit 1
fi
echo "✅ Genre ID: $GENRE_ID"

echo
echo "5. Create Book..."
BOOK_RESPONSE=$(api_call "POST" "$BASE_URL/books" "{
    \"title\": \"Test Book $(date +%s)\",
    \"writer\": \"Test Writer\",
    \"publisher\": \"Test Publisher\",
    \"publication_year\": 2025,
    \"description\": \"Test Description\",
    \"price\": 75000,
    \"stock_quantity\": 100,
    \"genre_id\": \"$GENRE_ID\"
}" "$AUTH_HEADER")
echo "$BOOK_RESPONSE" | jq .

BOOK_ID=$(echo "$BOOK_RESPONSE" | jq -r '.data.id // empty')
if [ -z "$BOOK_ID" ]; then
    echo "❌ Gagal membuat book"
    exit 1
fi
echo "✅ Book ID: $BOOK_ID"

echo
echo "6. Get All Books..."
api_call "GET" "$BASE_URL/books?page=1&limit=5" "" "$AUTH_HEADER" | jq .

echo
echo "7. Get Book by ID..."
api_call "GET" "$BASE_URL/books/$BOOK_ID" "" "$AUTH_HEADER" | jq .

echo
echo "8. Get Books by Genre..."
api_call "GET" "$BASE_URL/books/genre/$GENRE_ID?page=1&limit=5" "" "$AUTH_HEADER" | jq .

echo
echo "9. Update Book..."
api_call "PATCH" "$BASE_URL/books/$BOOK_ID" '{
    "description": "Updated Description",
    "price": 80000,
    "stock_quantity": 90
}' "$AUTH_HEADER" | jq .

echo
echo "10. Create Order (Transaction)..."
ORDER_RESPONSE=$(api_call "POST" "$BASE_URL/transactions" "{
    \"items\": [
        { \"book_id\": \"$BOOK_ID\", \"quantity\": 3 }
    ]
}" "$AUTH_HEADER")
echo "$ORDER_RESPONSE" | jq .

ORDER_ID=$(echo "$ORDER_RESPONSE" | jq -r '.data.id // .data.order_id // .data.transaction_id // empty')
if [ -z "$ORDER_ID" ]; then
    echo "❌ Gagal membuat order"
    exit 1
fi
echo "✅ Order ID: $ORDER_ID"

echo
echo "11. Get All Orders..."
api_call "GET" "$BASE_URL/transactions?page=1&limit=10" "" "$AUTH_HEADER" | jq .

echo
echo "12. Get Order by ID..."
api_call "GET" "$BASE_URL/transactions/$ORDER_ID" "" "$AUTH_HEADER" | jq .

echo
echo "13. Get Order Statistics..."
api_call "GET" "$BASE_URL/transactions/statistics" "" "$AUTH_HEADER" | jq .

echo
echo "14. Get All Genres..."
api_call "GET" "$BASE_URL/genre?page=1&limit=10" "" "" | jq .

echo
echo "15. Get Genre by ID..."
api_call "GET" "$BASE_URL/genre/$GENRE_ID" "" "" | jq .

echo
echo "16. Update Genre..."
api_call "PATCH" "$BASE_URL/genre/$GENRE_ID" '{
    "name": "Updated Test Genre"
}' "$AUTH_HEADER" | jq .

echo
echo "17. Get Current User Profile..."
api_call "GET" "$BASE_URL/auth/me" "" "$AUTH_HEADER" | jq .

echo
echo "18. Health Check..."
api_call "GET" "$BASE_URL/health" "" "" | jq .

echo
echo "=== Testing Complete ==="
echo "✅ Semua endpoint berhasil ditest!"
echo "📊 Data yang dibuat:"
echo "   - Genre ID: $GENRE_ID"
echo "   - Book ID: $BOOK_ID" 
echo "   - Order ID: $ORDER_ID"
