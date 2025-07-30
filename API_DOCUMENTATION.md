# AfroBank API Documentation

## Overview
This document provides comprehensive documentation for all API endpoints in the AfroBank microservices API. The API serves data that was previously hardcoded in the React Native app.

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication using Bearer tokens:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 1. Bills Management (`/api/bills`)

#### Get Bill Categories
```http
GET /api/bills/categories
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Electricity",
      "icon": "Zap",
      "color": "#F59E0B",
      "count": 2
    }
  ],
  "message": "Bill categories retrieved successfully"
}
```

#### Get Bill Category by ID
```http
GET /api/bills/categories/:id
```

#### Get Upcoming Bills
```http
GET /api/bills/upcoming
```
**Headers:** `Authorization: Bearer <token>`

#### Get Upcoming Bills by User
```http
GET /api/bills/upcoming/:userId
```
**Headers:** `Authorization: Bearer <token>`

#### Get Bill Providers
```http
GET /api/bills/providers
```

#### Get Bill Providers by Category
```http
GET /api/bills/providers/:category
```

#### Pay Bill
```http
POST /api/bills/pay
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "billId": "123",
  "amount": "89.50",
  "provider": "City Power",
  "category": "electricity"
}
```

#### Get Payment History
```http
GET /api/bills/payment-history
```
**Headers:** `Authorization: Bearer <token>`

### 2. Cards Management (`/api/cards`)

#### Get All Cards
```http
GET /api/cards
```
**Headers:** `Authorization: Bearer <token>`

#### Get Cards by User ID
```http
GET /api/cards/:userId
```
**Headers:** `Authorization: Bearer <token>`

#### Create New Card
```http
POST /api/cards/create
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "cardholderName": "John Doe",
  "cardType": "debit"
}
```

#### Create Virtual Card
```http
POST /api/cards/create/virtual
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "cardholderName": "John Doe"
}
```

#### Get Card Details
```http
GET /api/cards/:cardId/details
```
**Headers:** `Authorization: Bearer <token>`

#### Update Card Details
```http
PUT /api/cards/:cardId/details
```
**Headers:** `Authorization: Bearer <token>`

#### Get Card Transactions
```http
GET /api/cards/:cardId/transactions
```
**Headers:** `Authorization: Bearer <token>`

#### Card Actions
```http
POST /api/cards/:cardId/freeze
POST /api/cards/:cardId/unfreeze
POST /api/cards/:cardId/block
POST /api/cards/:cardId/unblock
```
**Headers:** `Authorization: Bearer <token>`

#### Get Card Limits
```http
GET /api/cards/:cardId/limits
```
**Headers:** `Authorization: Bearer <token>`

#### Update Card Limits
```http
PUT /api/cards/:cardId/limits
```
**Headers:** `Authorization: Bearer <token>`

#### Get Card Types
```http
GET /api/cards/types
```

#### Validate Card Name
```http
POST /api/cards/validate/name
```
**Body:**
```json
{
  "cardholderName": "John Doe"
}
```

#### Validate Card Type
```http
POST /api/cards/validate/type
```
**Body:**
```json
{
  "cardType": "debit"
}
```

### 3. Wallet Management (`/api/wallet`)

#### Get Wallet Cards
```http
GET /api/wallet/cards
```
**Headers:** `Authorization: Bearer <token>`

#### Get Wallet Balance
```http
GET /api/wallet/balance
```
**Headers:** `Authorization: Bearer <token>`

#### Update Wallet Balance
```http
PUT /api/wallet/balance
```
**Headers:** `Authorization: Bearer <token>`

#### Get Payment Methods
```http
GET /api/wallet/payment-methods
```
**Headers:** `Authorization: Bearer <token>`

#### Add Payment Method
```http
POST /api/wallet/payment-methods
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "type": "bank_account",
  "name": "First Bank",
  "accountNumber": "1234567890"
}
```

#### Delete Payment Method
```http
DELETE /api/wallet/payment-methods/:id
```
**Headers:** `Authorization: Bearer <token>`

#### Link Bank Account
```http
POST /api/wallet/link-bank
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "bankName": "First Bank",
  "accountNumber": "1234567890",
  "accountName": "John Doe"
}
```

#### Get Linked Banks
```http
GET /api/wallet/linked-banks
```
**Headers:** `Authorization: Bearer <token>`

#### Add Mobile Money
```http
POST /api/wallet/mobile-money
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "provider": "MTN",
  "phoneNumber": "+2341234567890",
  "accountName": "John Doe"
}
```

#### Get Mobile Money Providers
```http
GET /api/wallet/mobile-money-providers
```

#### Get Wallet Options
```http
GET /api/wallet/options
```

#### Get Quick Actions
```http
GET /api/wallet/quick-actions
```
**Headers:** `Authorization: Bearer <token>`

### 4. Profile Management (`/api/profile`)

#### Get Profile Options
```http
GET /api/profile/options
```

#### Get User Profile
```http
GET /api/profile
```
**Headers:** `Authorization: Bearer <token>`

#### Update User Profile
```http
PUT /api/profile
```
**Headers:** `Authorization: Bearer <token>`

#### Get Security Settings
```http
GET /api/profile/security
```
**Headers:** `Authorization: Bearer <token>`

#### Update Security Settings
```http
PUT /api/profile/security
```
**Headers:** `Authorization: Bearer <token>`

#### Change PIN
```http
POST /api/profile/change-pin
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "currentPin": "123456",
  "newPin": "654321"
}
```

#### Reset PIN
```http
POST /api/profile/reset-pin
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "phoneNumber": "+2341234567890",
  "otpVerified": true
}
```

#### Get Notification Settings
```http
GET /api/profile/notifications
```
**Headers:** `Authorization: Bearer <token>`

#### Update Notification Settings
```http
PUT /api/profile/notifications
```
**Headers:** `Authorization: Bearer <token>`

### 5. Transactions Management (`/api/transactions`)

#### Get Transaction Filters
```http
GET /api/transactions/filters
```

#### Get Transaction Types
```http
GET /api/transactions/types
```

#### Get Transaction History
```http
GET /api/transactions/history
```
**Headers:** `Authorization: Bearer <token>`

#### Get Filtered Transactions
```http
GET /api/transactions/history/filtered?type=income&period=month&category=food
```
**Headers:** `Authorization: Bearer <token>`

#### Get Transaction Summary
```http
GET /api/transactions/summary
```
**Headers:** `Authorization: Bearer <token>`

#### Get Transaction by ID
```http
GET /api/transactions/:transactionId
```
**Headers:** `Authorization: Bearer <token>`

#### Create Transaction
```http
POST /api/transactions
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "type": "expense",
  "title": "Grocery Shopping",
  "amount": 150.50,
  "currency": "USD",
  "category": "food",
  "description": "Purchase from Walmart"
}
```

#### Get Transaction Categories
```http
GET /api/transactions/categories
```

#### Get Transaction Periods
```http
GET /api/transactions/periods
```

#### Export Transaction History
```http
POST /api/transactions/export
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "format": "csv",
  "period": "month",
  "type": "all"
}
```

### 6. Support Management (`/api/support`)

#### Get Help Categories
```http
GET /api/support/categories
```

#### Get FAQ
```http
GET /api/support/faq
```

#### Get FAQ by Category
```http
GET /api/support/faq/:category
```

#### Search FAQ
```http
GET /api/support/faq/search/:query
```

#### Create Support Ticket
```http
POST /api/support/tickets
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "category": "Account Issues",
  "subject": "Cannot login to account",
  "description": "I am unable to login to my account",
  "priority": "high"
}
```

#### Get User Support Tickets
```http
GET /api/support/tickets
```
**Headers:** `Authorization: Bearer <token>`

#### Get Support Ticket Details
```http
GET /api/support/tickets/:ticketId
```
**Headers:** `Authorization: Bearer <token>`

#### Add Message to Ticket
```http
POST /api/support/tickets/:ticketId/messages
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "message": "I need help with my account"
}
```

#### Close Support Ticket
```http
POST /api/support/tickets/:ticketId/close
```
**Headers:** `Authorization: Bearer <token>`

#### Get Contact Information
```http
GET /api/support/contact
```

#### Submit Feedback
```http
POST /api/support/feedback
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "type": "App Experience",
  "rating": 5,
  "comment": "Great app experience!"
}
```

#### Get Feedback Types
```http
GET /api/support/feedback/types
```

#### Get Support Statistics
```http
GET /api/support/statistics
```
**Headers:** `Authorization: Bearer <token>`

### 7. Common Configuration (`/api/common`)

#### Get Country Codes
```http
GET /api/common/country-codes
```

#### Get App Settings
```http
GET /api/common/settings
```

#### Get Default Values
```http
GET /api/common/defaults
```

#### Get API Endpoints Configuration
```http
GET /api/common/api-endpoints
```

#### Get Dashboard Widgets
```http
GET /api/common/dashboard-widgets
```

#### Get Summary Cards
```http
GET /api/common/summary-cards
```

#### Get App Version
```http
GET /api/common/version
```

#### Health Check
```http
GET /api/common/health
```

#### Get App Configuration
```http
GET /api/common/config
```

#### Get Supported Currencies
```http
GET /api/common/currencies
```

#### Get Supported Languages
```http
GET /api/common/languages
```

#### Get Timezones
```http
GET /api/common/timezones
```

#### Get Date Formats
```http
GET /api/common/date-formats
```

#### Get Time Formats
```http
GET /api/common/time-formats
```

#### Get Themes
```http
GET /api/common/themes
```

#### Get App Permissions
```http
GET /api/common/permissions
```

#### Get App Features
```http
GET /api/common/features
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

## Success Responses

All endpoints return consistent success responses:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

## Authentication Errors

```json
{
  "success": false,
  "error": "Access token required"
}
```

```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

## CORS

The API supports CORS with the following configuration:
- Origin: Configurable via `FRONTEND_URL` environment variable
- Credentials: true
- Methods: GET, POST, PUT, DELETE, OPTIONS

## Environment Variables

Required environment variables:
- `PORT`: Server port (default: 5000)
- `JWT_SECRET`: Secret key for JWT tokens
- `FRONTEND_URL`: Frontend URL for CORS
- `NODE_ENV`: Environment (development/production)

## Testing

You can test the API endpoints using tools like:
- Postman
- cURL
- Thunder Client (VS Code extension)

## Example cURL Commands

### Get Bill Categories
```bash
curl -X GET http://localhost:5000/api/bills/categories
```

### Get User Profile (with auth)
```bash
curl -X GET http://localhost:5000/api/profile \
  -H "Authorization: Bearer your-jwt-token"
```

### Create Support Ticket
```bash
curl -X POST http://localhost:5000/api/support/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "category": "Account Issues",
    "subject": "Cannot login",
    "description": "I am unable to login to my account",
    "priority": "high"
  }'
``` 