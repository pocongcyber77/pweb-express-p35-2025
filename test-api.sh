#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "1) Register user"
curl -sS -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Mr Dummy",
    "email": "dummy@example.com",
    "password": "Dummy.12345"
  }' | jq .

echo "2) Login to get JWT"
JWT=$(curl -sS -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dummy@example.com",
    "password": "Dummy.12345"
  }' | jq -r '.data.token')

echo "JWT: $JWT"

AUTH_HEADER="Authorization: Bearer $JWT"
CONTENT_JSON="Content-Type: application/json"

echo "3) Create Genre"
GENRE_ID=$(curl -sS -X POST "$BASE_URL/genre" \
  -H "$CONTENT_JSON" -H "$AUTH_HEADER" \
  -d '{
    "name": "Dummy Genre"
  }' | jq -r '.data.id')
echo "GENRE_ID: $GENRE_ID"

echo "4) Create Book"
BOOK_ID=$(curl -sS -X POST "$BASE_URL/books" \
  -H "$CONTENT_JSON" -H "$AUTH_HEADER" \
  -d "{
    \"title\": \"Dummy Book\",
    \"writer\": \"Dummy Writer\",
    \"publisher\": \"Dummy Publisher\",
    \"publication_year\": 2025,
    \"description\": \"Dummy Description\",
    \"price\": 50000,
    \"stock_quantity\": 50,
    \"genre_id\": \"$GENRE_ID\"
  }" | jq -r '.data.id')
echo "BOOK_ID: $BOOK_ID"

echo "5) Create Order (Transactions)"
ORDER_ID=$(curl -sS -X POST "$BASE_URL/transactions" \
  -H "$CONTENT_JSON" -H "$AUTH_HEADER" \
  -d "{
    \"items\": [
      { \"book_id\": \"$BOOK_ID\", \"quantity\": 2 }
    ]
  }" | jq -r '.data.id // .data.order_id // .data.transaction_id // empty')
echo "ORDER_ID: ${ORDER_ID:-(cek response)}"

echo "6) List Orders"
curl -sS "$BASE_URL/transactions?page=1&limit=10" \
  -H "$AUTH_HEADER" | jq .

if [ -n "${ORDER_ID:-}" ]; then
  echo "7) Get Order by ID"
  curl -sS "$BASE_URL/transactions/$ORDER_ID" \
    -H "$AUTH_HEADER" | jq .
fi

echo "8) Get Orders Statistics"
curl -sS "$BASE_URL/transactions/statistics" \
  -H "$AUTH_HEADER" | jq .

echo "9) Health Check"
curl -sS "$BASE_URL/health" | jq .


