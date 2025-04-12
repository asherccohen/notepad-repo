# REST API Naming Made Simple!

1. Use plural nouns for collections (e.g., `/users`, `/orders`).
2. Use meaningful actions in names (e.g., `/mark-read`, `/cancel`).
3. Version your endpoints (e.g., `/api/v1`).
4. Use query params for sorting, filtering, and pagination.
5. Stay consistent with verbs and resource naming conventions.
6. Let HTTP methods describe actions instead of redundant path names (e.g., GET for retrieve).

---

## 🧑‍💼 User Management
- **GET** `/api/v1/users`  
  🔍 Retrieve a list of users  
- **GET** `/api/v1/users/{id}`  
  🔍 Retrieve a specific user by ID  
- **POST** `/api/v1/users`  
  ➕ Create a new user  
- **PUT** `/api/v1/users/{id}`  
  ✏️ Update a user's information  
- **DELETE** `/api/v1/users/{id}`  
  🗑️ Delete a user  

---

## 🔐 Authentication & Authorization
- **POST** `/api/v1/auth/login`  
  🔐 User login  
- **POST** `/api/v1/auth/register`  
  📝 User registration  
- **POST** `/api/v1/auth/logout`  
  🚪 User logout  
- **POST** `/api/v1/auth/refresh`  
  🔄 Refresh an expired token  

---

## 🛒 Product Management
- **GET** `/api/v1/products`  
  🔍 Retrieve all products  
- **GET** `/api/v1/products/{id}`  
  🔍 Retrieve a specific product  
- **POST** `/api/v1/products`  
  ➕ Add a new product  
- **PUT** `/api/v1/products/{id}`  
  ✏️ Update product details  
- **DELETE** `/api/v1/products/{id}`  
  🗑️ Remove a product from the catalog  

---

## 📦 Order Management
- **GET** `/api/v1/orders`  
  🔍 Retrieve all orders  
- **GET** `/api/v1/orders/{id}`  
  🔍 Retrieve details of a specific order  
- **POST** `/api/v1/orders`  
  ➕ Create a new order  
- **PUT** `/api/v1/orders/{id}`  
  ✏️ Update order details  
- **DELETE** `/api/v1/orders/{id}`  
  ❌ Cancel an order  

---

## 🔍 Search and Filters
- **GET** `/api/v1/products?search=phone&category=electronics`  
  🔍 Search and filter products  
- **GET** `/api/v1/orders?status=shipped&page=1&limit=20`  
  🔍 Paginated and filtered orders  

---

## 📊 Analytics
- **GET** `/api/v1/analytics/sales`  
  📈 Retrieve sales analytics  
- **GET** `/api/v1/analytics/users`  
  📈 Retrieve user growth analytics  
- **GET** `/api/v1/analytics/traffic`  
  📈 Retrieve website traffic analytics  

---

## 🔔 Notifications
- **GET** `/api/v1/notifications`  
  🔔 Retrieve all notifications  
- **POST** `/api/v1/notifications/mark-read`  
  ✅ Mark notifications as read  
- **DELETE** `/api/v1/notifications/{id}`  
  🗑️ Delete a specific notification  

---

## 📝 Reporting
- **GET** `/api/v1/reports/sales-summary`  
  📄 Generate a sales summary report  
- **GET** `/api/v1/reports/daily-activity`  
  📄 Retrieve daily activity data  

---

## 🛠️ Admin Operations
- **GET** `/api/v1/admin/users`  
  🔍 List all users (Admin only)  
- **POST** `/api/v1/admin/maintenance`  
  🔧 Trigger a system maintenance task  
- **GET** `/api/v1/admin/logs`  
  📜 Fetch server logs (Debugging)  

---

## 🛡️ Utility Operations
- **GET** `/api/v1/utils/status`  
  ✅ Check the API status or uptime  
- **POST** `/api/v1/utils/feedback`  
  📝 Submit user feedback or bug reports