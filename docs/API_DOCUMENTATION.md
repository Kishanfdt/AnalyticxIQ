# AnalyticxIQ API Documentation

This document describes the REST API endpoints provided by the AnalyticxIQ backend server.

## Global Configurations

- **Base URL**: `/api/v1` (e.g. `http://localhost:5000/api/v1`)
- **Content Type**: `application/json`
- **Security Header**: All private endpoints require a JSON Web Token (JWT) sent via the `Authorization` header.
  ```http
  Authorization: Bearer <token>
  ```

---

## 🔒 Authentication API

### 1. Register User & Tenant Business

Creates a new tenant business and an associated owner user account.

- **URL**: `/auth/register`
- **Method**: `POST`
- **Auth Required**: No (Public)
- **Request Body**:
  ```json
  {
    "name": "Jane Admin",
    "email": "jane.admin@example.com",
    "password": "Password123!",
    "businessName": "Global Inc"
  }
  ```
- **Success Response** (HTTP `201 Created`):
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": "user-uuid-1111",
        "name": "Jane Admin",
        "email": "jane.admin@example.com",
        "role": "OWNER"
      },
      "business": {
        "id": "business-uuid-2222",
        "name": "Global Inc",
        "slug": "global-inc-abcd"
      }
    }
  }
  ```

### 2. User Login

Authenticates user credentials and issues an access token.

- **URL**: `/auth/login`
- **Method**: `POST`
- **Auth Required**: No (Public)
- **Request Body**:
  ```json
  {
    "email": "jane.admin@example.com",
    "password": "Password123!"
  }
  ```
- **Success Response** (HTTP `200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": "user-uuid-1111",
        "name": "Jane Admin",
        "email": "jane.admin@example.com",
        "role": "OWNER"
      },
      "business": {
        "id": "business-uuid-2222",
        "name": "Global Inc",
        "slug": "global-inc-abcd"
      }
    }
  }
  ```

### 3. Get Active User Details

Retrieves details of the currently authenticated user session.

- **URL**: `/auth/me`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response** (HTTP `200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "user-uuid-1111",
        "email": "jane.admin@example.com",
        "name": "Jane Admin",
        "role": "OWNER",
        "businessId": "business-uuid-2222"
      }
    }
  }
  ```

---

## 📦 Products API

### 1. List Products (Paginated)

Retrieves a list of products registered under the authenticated user's tenant business.

- **URL**: `/products`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `page` (optional): Page number (default: `1`)
  - `limit` (optional): Items per page (default: `10`)
  - `search` (optional): Search query matching product Name or SKU.
- **Success Response** (HTTP `200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "products": [
        {
          "id": "product-uuid-3333",
          "name": "Elite Laptop",
          "sku": "SKU-LAP-001",
          "price": "1500.00",
          "costPrice": "1000.00",
          "stock": 30,
          "description": "Premium development laptop",
          "categoryId": "category-uuid-4444",
          "createdAt": "2026-08-05T12:00:00Z",
          "category": {
            "id": "category-uuid-4444",
            "name": "Electronics"
          }
        }
      ],
      "meta": {
        "total": 1,
        "page": 1,
        "limit": 10,
        "totalPages": 1
      }
    }
  }
  ```

### 2. Create Product

- **URL**: `/products`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "name": "Elite Laptop",
    "sku": "SKU-LAP-001",
    "price": 1500.0,
    "costPrice": 1000.0,
    "stock": 30,
    "description": "Premium development laptop",
    "categoryName": "Electronics"
  }
  ```
- **Success Response** (HTTP `201 Created`):
  ```json
  {
    "success": true,
    "data": {
      "id": "product-uuid-3333",
      "name": "Elite Laptop",
      "sku": "SKU-LAP-001",
      "price": "1500.00",
      "costPrice": "1000.00",
      "stock": 30
    }
  }
  ```

---

## 👥 Customers API

### 1. Create Customer

- **URL**: `/customers`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "name": "Alice Green",
    "email": "alice@green.com",
    "phone": "5551234",
    "company": "Green Ventures",
    "region": "West"
  }
  ```
- **Success Response** (HTTP `201 Created`):
  ```json
  {
    "success": true,
    "data": {
      "id": "customer-uuid-5555",
      "name": "Alice Green",
      "email": "alice@green.com",
      "company": "Green Ventures",
      "region": "West"
    }
  }
  ```

---

## 💰 Sales API

### 1. Create Sale Transaction

- **URL**: `/sales`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "customerId": "customer-uuid-5555",
    "saleDate": "2026-08-05T00:00:00.000Z",
    "items": [
      {
        "productId": "product-uuid-3333",
        "quantity": 2,
        "unitPrice": 1500.0,
        "discount": 10
      }
    ]
  }
  ```
- **Success Response** (HTTP `201 Created`):
  ```json
  {
    "success": true,
    "data": {
      "id": "sale-uuid-6666",
      "customerId": "customer-uuid-5555",
      "totalAmount": "2700.00",
      "status": "COMPLETED",
      "items": [
        {
          "id": "item-uuid-7777",
          "productId": "product-uuid-3333",
          "quantity": 2,
          "unitPrice": "1350.00",
          "discount": "10.00"
        }
      ]
    }
  }
  ```

---

## 📊 Analytics API

### 1. Get Advanced Analytics Dashboard Summary

Retrieves comprehensive aggregate metrics, product leaders, category distributions, and geographic trends.

- **URL**: `/analytics/advanced`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `startDate` (optional): Filter start date (YYYY-MM-DD)
  - `endDate` (optional): Filter end date (YYYY-MM-DD)
- **Success Response** (HTTP `200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "grossRevenue": 3000,
      "netRevenue": 2700,
      "profit": 700,
      "profitMargin": 25.92,
      "totalOrders": 1,
      "averageOrderValue": 2700,
      "customerPurchaseFrequency": 1,
      "revenueGrowth": 0,
      "monthlyGrowth": [{ "month": "2026-08", "revenue": 2700, "growthRate": 0 }],
      "topPerformingProducts": [
        {
          "productId": "product-uuid-3333",
          "name": "Elite Laptop",
          "sku": "SKU-LAP-001",
          "quantitySold": 2,
          "revenue": 2700
        }
      ],
      "salesByRegion": [{ "region": "West", "revenue": 2700, "ordersCount": 1 }],
      "salesByCategory": [
        { "categoryId": "category-uuid-4444", "name": "Electronics", "revenue": 2700 }
      ]
    }
  }
  ```

---

## 📥 Ingestion & Import API

### 1. CSV Product Batch Ingestion

- **URL**: `/import/products`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Type**: `multipart/form-data`
- **Form Payload**: `file` (a CSV file containing fields: `sku`, `name`, `price`, `costPrice`, `stock`, `description`, `categoryName`)
- **Success Response** (HTTP `200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "importedCount": 2,
      "duplicatesCount": 0
    }
  }
  ```

---

## 📤 Export API

### 1. Export Sales Report

- **URL**: `/export/sales`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `format`: `csv` or `xlsx` (default: `csv`)
- **Success Response**: Triggers file download (binary stream `text/csv` or `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`).
