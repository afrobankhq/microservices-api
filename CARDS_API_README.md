# Cards API Documentation

This document describes the updated Cards API endpoints that integrate with Swervpay for dynamic card management.

## Environment Variables Required

Add these to your `.env` file:

```bash
# Swervpay API Configuration
SWERVPAY_API_URL=https://api.swervpay.co
SWERVPAY_API_KEY=your_swervpay_api_key_here
SWERVPAY_SECRET_KEY=your_swervpay_secret_key_here
```

## API Endpoints

### Authentication
All endpoints require authentication via the `authenticate` middleware.

### 1. Card Management

#### Get All Cards
- **GET** `/api/cards?customerId=123&page=1&limit=10`
- **Description**: Retrieve all cards for a specific customer
- **Query Parameters**:
  - `customerId` (required): The customer ID
  - `page` (optional): Page number for pagination (default: 1)
  - `limit` (optional): Number of cards per page (default: 10)

#### Get Specific Card
- **GET** `/api/cards/:cardId`
- **Description**: Retrieve details of a specific card
- **Path Parameters**:
  - `cardId`: The unique identifier of the card

#### Create Card
- **POST** `/api/cards`
- **Description**: Create a new card
- **Request Body**:
  ```json
  {
    "customer_id": "cust_123",
    "card_type": "physical",
    "cardholder_name": "John Doe",
    "currency": "USD",
    "metadata": {}
  }
  ```

#### Update Card
- **PUT** `/api/cards/:cardId`
- **Description**: Update card details
- **Path Parameters**:
  - `cardId`: The unique identifier of the card
- **Request Body**: Any fields to update

### 2. Card Funding & Withdrawal

#### Fund Card
- **POST** `/api/cards/:cardId/fund`
- **Description**: Add funds to a card
- **Path Parameters**:
  - `cardId`: The unique identifier of the card
- **Request Body**:
  ```json
  {
    "amount": 100.00,
    "currency": "USD",
    "source": "wallet",
    "description": "Monthly allowance"
  }
  ```

#### Withdraw from Card
- **POST** `/api/cards/:cardId/withdraw`
- **Description**: Withdraw funds from a card
- **Path Parameters**:
  - `cardId`: The unique identifier of the card
- **Request Body**:
  ```json
  {
    "amount": 50.00,
    "currency": "USD",
    "destination": "bank_account",
    "description": "ATM withdrawal"
  }
  ```

### 3. Card Status Management

#### Freeze Card
- **POST** `/api/cards/:cardId/freeze`
- **Description**: Temporarily freeze a card
- **Path Parameters**:
  - `cardId`: The unique identifier of the card
- **Request Body** (optional):
  ```json
  {
    "reason": "Lost card"
  }
  ```

#### Unfreeze Card
- **POST** `/api/cards/:cardId/unfreeze`
- **Description**: Unfreeze a previously frozen card
- **Path Parameters**:
  - `cardId`: The unique identifier of the card

#### Terminate Card
- **POST** `/api/cards/:cardId/terminate`
- **Description**: Permanently terminate a card
- **Path Parameters**:
  - `cardId`: The unique identifier of the card
- **Request Body** (optional):
  ```json
  {
    "reason": "Card replacement"
  }
  ```

### 4. Card Transactions

#### Get Card Transactions
- **GET** `/api/cards/:cardId/transactions?page=1&limit=10&start_date=2024-01-01&end_date=2024-01-31&type=purchase`
- **Description**: Retrieve transaction history for a card
- **Path Parameters**:
  - `cardId`: The unique identifier of the card
- **Query Parameters**:
  - `page` (optional): Page number for pagination
  - `limit` (optional): Number of transactions per page
  - `start_date` (optional): Start date for filtering (YYYY-MM-DD)
  - `end_date` (optional): End date for filtering (YYYY-MM-DD)
  - `type` (optional): Transaction type filter

#### Get Specific Transaction
- **GET** `/api/cards/:cardId/transactions/:transactionId`
- **Description**: Retrieve details of a specific transaction
- **Path Parameters**:
  - `cardId`: The unique identifier of the card
  - `transactionId`: The unique identifier of the transaction

### 5. Card Information

#### Get Card Balance
- **GET** `/api/cards/:cardId/balance`
- **Description**: Retrieve current balance of a card
- **Path Parameters**:
  - `cardId`: The unique identifier of the card

### 6. Validation

#### Validate Card Request
- **POST** `/api/cards/validate`
- **Description**: Validate card creation parameters before creating
- **Request Body**:
  ```json
  {
    "customer_id": "cust_123",
    "card_type": "physical",
    "cardholder_name": "John Doe",
    "currency": "USD"
  }
  ```

## Legacy Endpoints (Backward Compatibility)

The following legacy endpoints are maintained for backward compatibility:

- `GET /api/cards/user/:userId` - Get cards by user ID
- `POST /api/cards/create` - Create card (legacy endpoint)
- `POST /api/cards/create/virtual` - Create virtual card
- `GET /api/cards/:cardId/details` - Get card details
- `PUT /api/cards/:cardId/details` - Update card details
- `POST /api/cards/:cardId/block` - Block card (alias for freeze)
- `POST /api/cards/:cardId/unblock` - Unblock card (alias for unfreeze)
- `GET /api/cards/:cardId/limits` - Get card limits (placeholder)
- `PUT /api/cards/:cardId/limits` - Update card limits (placeholder)
- `GET /api/cards/types` - Get card types (placeholder)
- `GET /api/cards/types/available` - Get available card types (placeholder)
- `POST /api/cards/validate/name` - Validate cardholder name
- `POST /api/cards/validate/type` - Validate card type

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

## Success Responses

All successful endpoints return:

```json
{
  "success": true,
  "data": {...},
  "message": "Operation completed successfully"
}
```

## Rate Limiting

The API includes rate limiting to prevent abuse. Please implement appropriate retry logic in your client applications.

## Testing

To test the API endpoints:

1. Set up your environment variables
2. Install dependencies: `npm install`
3. Start the server: `npm run dev`
4. Use tools like Postman or curl to test the endpoints

## Dependencies

Make sure to install the required dependency:

```bash
npm install axios
```

## Notes

- All amounts should be provided as numbers (e.g., 100.00 for $100.00)
- Currency codes should follow ISO 4217 standard (USD, NGN, GBP, EUR)
- Card types supported: `physical`, `virtual`
- All timestamps are returned in ISO 8601 format
- The API automatically handles authentication with Swervpay using your API credentials
