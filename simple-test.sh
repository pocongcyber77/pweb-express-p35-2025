#!/usr/bin/env bash
set -e

BASE_URL="http://localhost:3000"

echo "=== Simple API Test ==="

# 1. Health Check
echo "1. Health Check:"
curl -sS "$BASE_URL/health" | jq .
echo

# 2. Register
echo "2. Register User:"
curl -sS -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Test User 2",
    "email": "test2@example.com",
    "password": "Test.12345"
  }' | jq .
echo

# 3. Login
echo "3. Login:"
LOGIN_RESPONSE=$(curl -sS -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test2@example.com",
    "password": "Test.12345"
  }')

echo "$LOGIN_RESPONSE" | jq .

JWT=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token')
echo "JWT: ${JWT:0:50}..."
echo

# 4. Create Genre
echo "4. Create Genre:"
GENRE_RESPONSE=$(curl -sS -X POST "$BASE_URL/genre" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT" \
  -d '{
    "name": "Test Genre '$(date +%s)'"
  }')

echo "$GENRE_RESPONSE" | jq .
GENRE_ID=$(echo "$GENRE_RESPONSE" | jq -r '.data.id')
echo "Genre ID: $GENRE_ID"
echo

# 5. Create Book
echo "5. Create Book:"
BOOK_RESPONSE=$(curl -sS -X POST "$BASE_URL/books" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT" \
  -d "{
    \"title\": \"Test Book $(date +%s)\",
    \"writer\": \"Test Writer\",
    \"publisher\": \"Test Publisher\",
    \"publication_year\": 2025,
    \"description\": \"Test Description\",
    \"price\": 75000,
    \"stock_quantity\": 100,
    \"genre_id\": \"$GENRE_ID\"
  }")

echo "$BOOK_RESPONSE" | jq .
BOOK_ID=$(echo "$BOOK_RESPONSE" | jq -r '.data.id')
echo "Book ID: $BOOK_ID"
echo

# 6. Get All Books
echo "6. Get All Books:"
curl -sS -X GET "$BASE_URL/books?page=1&limit=5" \
  -H "Authorization: Bearer $JWT" | jq .
echo

# 7. Get Book by ID
echo "7. Get Book by ID:"
curl -sS -X GET "$BASE_URL/books/$BOOK_ID" \
  -H "Authorization: Bearer $JWT" | jq .
echo

# 8. Create Order
echo "8. Create Order:"
ORDER_RESPONSE=$(curl -sS -X POST "$BASE_URL/transactions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT" \
  -d "{
    \"items\": [
      { \"book_id\": \"$BOOK_ID\", \"quantity\": 2 }
    ]
  }")

echo "$ORDER_RESPONSE" | jq .
ORDER_ID=$(echo "$ORDER_RESPONSE" | jq -r '.data.id // .data.order_id // .data.transaction_id')
echo "Order ID: $ORDER_ID"
echo

# 9. Get All Orders
echo "9. Get All Orders:"
curl -sS -X GET "$BASE_URL/transactions?page=1&limit=5" \
  -H "Authorization: Bearer $JWT" | jq .
echo

# 10. Get Order by ID
if [ "$ORDER_ID" != "null" ] && [ -n "$ORDER_ID" ]; then
  echo "10. Get Order by ID:"
  curl -sS -X GET "$BASE_URL/transactions/$ORDER_ID" \
    -H "Authorization: Bearer $JWT" | jq .
  echo
fi

# 11. Get Statistics
echo "11. Get Order Statistics:"
curl -sS -X GET "$BASE_URL/transactions/statistics" \
  -H "Authorization: Bearer $JWT" | jq .
echo

echo "=== Test Complete ==="


