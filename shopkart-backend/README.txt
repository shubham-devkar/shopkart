SHOPKART FULL STACK - RUN GUIDE

Requirements: Java 17+, Maven (or IntelliJ Maven support), Node.js 20+, MySQL 8+, Angular CLI is not required globally.

1) DATABASE
Start MySQL. Open MySQL Workbench and run:
CREATE DATABASE shopkart_db;
You may also let Hibernate create it if your MySQL account has permission. Edit shopkart-backend/src/main/resources/application.properties and set spring.datasource.password to your actual MySQL password. Never upload real passwords to public repositories.

2) BACKEND (IntelliJ)
Open the shopkart-backend folder as a Maven project. Set Java SDK to 17. In application.properties configure MySQL password. Run ShopkartBackendApplication.java. Backend: http://localhost:8080
Product API: GET/POST http://localhost:8080/api/products
Register: POST http://localhost:8080/api/auth/register with {"name":"Test User","email":"test@example.com","password":"secret123"}
Login: POST http://localhost:8080/api/auth/login with {"email":"test@example.com","password":"secret123"}
Users and BCrypt password hashes are stored in MySQL. Login/Register from the Angular frontend call these APIs.

3) FRONTEND
Open a terminal in shopkart-angular:
  npm install
  npm start
Open http://localhost:4200 and choose Login / Create account. The frontend uses the running backend and database. Product listing uses /api/products. Use the Admin Products page for product CRUD in development.

PAYMENT GATEWAY
Live Razorpay payments require your own Razorpay account, API keys, and server-side order/signature verification. This package does not include secret keys and does not claim that live payment processing is active. Configure Razorpay only after adding server-side order creation and signature verification; never put a Razorpay secret in Angular code.

NOTE
Authentication endpoints are functional and passwords are BCrypt-hashed. Product CRUD endpoints are currently open for local development; before deployment, protect product write operations with admin authorization and add JWT/session validation to protected APIs. The returned token is a frontend login session marker, not a production-grade signed JWT. Do not deploy as-is for real customer payments or production use.
