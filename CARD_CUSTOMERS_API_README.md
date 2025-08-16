# Card Customers API Documentation

This document describes the Card Customers API endpoints that integrate with Swervpay for dynamic customer management.

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

### 1. Customer Management

#### Get All Customers
- **GET** `/api/card-customers?page=1&limit=10&status=active&search=john`
- **Description**: Retrieve all customers with optional filtering and pagination
- **Query Parameters**:
  - `page` (optional): Page number for pagination (default: 1)
  - `limit` (optional): Number of customers per page (default: 10)
  - `status` (optional): Filter by customer status (e.g., 'active', 'inactive', 'pending')
  - `search` (optional): Search customers by name, email, or phone

#### Get Specific Customer
- **GET** `/api/card-customers/:customerId`
- **Description**: Retrieve details of a specific customer
- **Path Parameters**:
  - `customerId`: The unique identifier of the customer

#### Create Customer
- **POST** `/api/card-customers`
- **Description**: Create a new customer
- **Request Body**:
  ```json
  {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "+2348012345678",
    "date_of_birth": "1990-01-01",
    "address": {
      "street": "123 Main St",
      "city": "Lagos",
      "state": "Lagos",
      "country": "Nigeria",
      "postal_code": "100001"
    },
    "metadata": {
      "source": "web",
      "referral_code": "REF123"
    }
  }
  ```

#### Update Customer
- **PUT** `/api/card-customers/:customerId`
- **Description**: Update customer details
- **Path Parameters**:
  - `customerId`: The unique identifier of the customer
- **Request Body**: Any fields to update (partial updates supported)

### 2. KYC (Know Your Customer) Management

#### Submit KYC Information
- **POST** `/api/card-customers/:customerId/kyc`
- **Description**: Submit KYC documents and information
- **Path Parameters**:
  - `customerId`: The unique identifier of the customer
- **Request Body**:
  ```json
  {
    "document_type": "national_id",
    "document_number": "12345678901",
    "document_front": "base64_encoded_front_image",
    "document_back": "base64_encoded_back_image",
    "selfie": "base64_encoded_selfie_image",
    "address_proof": "base64_encoded_address_proof",
    "additional_documents": [
      "base64_encoded_additional_doc1",
      "base64_encoded_additional_doc2"
    ]
  }
  ```

#### Get KYC Status
- **GET** `/api/card-customers/:customerId/kyc`
- **Description**: Retrieve KYC verification status
- **Path Parameters**:
  - `customerId`: The unique identifier of the customer

### 3. Blacklist Management

#### Blacklist Customer
- **POST** `/api/card-customers/:customerId/blacklist`
- **Description**: Add a customer to the blacklist
- **Path Parameters**:
  - `customerId`: The unique identifier of the customer
- **Request Body**:
  ```json
  {
    "reason": "Suspicious activity detected",
    "notes": "Multiple failed login attempts"
  }
  ```

#### Remove from Blacklist
- **POST** `/api/card-customers/:customerId/blacklist/remove`
- **Description**: Remove a customer from the blacklist
- **Path Parameters**:
  - `customerId`: The unique identifier of the customer
- **Request Body**:
  ```json
  {
    "reason": "Investigation completed, customer cleared"
  }
  ```

#### Get Blacklist Status
- **GET** `/api/card-customers/:customerId/blacklist`
- **Description**: Check if a customer is blacklisted
- **Path Parameters**:
  - `customerId`: The unique identifier of the customer

### 4. Validation & Utility

#### Validate Customer Request
- **POST** `/api/card-customers/validate`
- **Description**: Validate customer creation parameters before creating
- **Request Body**:
  ```json
  {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "+2348012345678",
    "date_of_birth": "1990-01-01"
  }
  ```

#### Search Customers
- **GET** `/api/card-customers/search?query=john&page=1&limit=10&status=active`
- **Description**: Search customers by various criteria
- **Query Parameters**:
  - `query` (required): Search term (name, email, phone)
  - `page` (optional): Page number for pagination
  - `limit` (optional): Number of results per page
  - `status` (optional): Filter by customer status

#### Get Customer Statistics
- **GET** `/api/card-customers/stats?period=month`
- **Description**: Retrieve customer statistics and analytics
- **Query Parameters**:
  - `period` (optional): Time period for statistics (day, week, month, year)

## Legacy Endpoints (Backward Compatibility)

The following legacy endpoints are maintained for backward compatibility:

- `GET /api/card-customers/user/:userId` - Get customer by user ID
- `POST /api/card-customers/create` - Create customer (legacy endpoint)
- `PUT /api/card-customers/user/:userId` - Update customer by user ID
- `GET /api/card-customers/:customerId/profile` - Get customer profile
- `PUT /api/card-customers/:customerId/profile` - Update customer profile
- `POST /api/card-customers/:customerId/verify` - Verify customer identity (alias for KYC)
- `GET /api/card-customers/:customerId/verify` - Get verification status (alias for KYC status)
- `POST /api/card-customers/:customerId/block` - Block customer (alias for blacklist)
- `POST /api/card-customers/:customerId/unblock` - Unblock customer (alias for remove from blacklist)
- `GET /api/card-customers/:customerId/block` - Get block status (alias for blacklist status)
- `GET /api/card-customers/:customerId/details` - Get customer details
- `PUT /api/card-customers/:customerId/details` - Update customer details
- `GET /api/card-customers/list` - Get customer list
- `GET /api/card-customers/count` - Get customer count

## Data Validation Rules

### Customer Creation Validation
- **First Name**: Required, minimum 2 characters, letters and spaces only
- **Last Name**: Required, minimum 2 characters, letters and spaces only
- **Email**: Required, valid email format
- **Phone**: Optional, basic phone number format validation
- **Date of Birth**: Optional, must be valid date, customer must be 18+ years old

### KYC Validation
- **Document Type**: Required, must be one of: passport, national_id, drivers_license, voters_card
- **Document Number**: Required, unique identifier for the document
- **Document Front**: Required, base64 encoded image
- **Document Back**: Optional, base64 encoded image
- **Selfie**: Optional, base64 encoded image
- **Address Proof**: Optional, base64 encoded image
- **Additional Documents**: Optional, array of base64 encoded images

### Blacklist Validation
- **Reason**: Required, explanation for blacklisting
- **Notes**: Optional, additional details

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

## Example API Calls

### Create a Customer
```bash
curl -X POST http://localhost:5000/api/card-customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@example.com",
    "phone": "+2348012345678"
  }'
```

### Submit KYC
```bash
curl -X POST http://localhost:5000/api/card-customers/CUST_123/kyc \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "document_type": "national_id",
    "document_number": "12345678901",
    "document_front": "base64_encoded_image"
  }'
```

### Search Customers
```bash
curl -X GET "http://localhost:5000/api/card-customers/search?query=jane&status=active" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Notes

- All dates should be in ISO 8601 format (YYYY-MM-DD)
- Phone numbers should include country code (e.g., +234 for Nigeria)
- Document images should be base64 encoded
- The API automatically handles authentication with Swervpay using your API credentials
- Customer IDs are generated by Swervpay and should be stored for future reference
- KYC status can be: pending, approved, rejected, or under_review
- Customer status can be: active, inactive, pending, or suspended
