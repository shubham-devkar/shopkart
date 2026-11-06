# 🛒 ShopKart – Full Stack E-Commerce Application

ShopKart is a full-stack e-commerce web application developed using Angular, Spring Boot, and MySQL. It provides an online shopping platform with product management, user authentication, cart, orders, and payment integration.

## 📁 Project Structure

```text
shopkart-fullstack/
│
├── shopkart-angular/       # Angular Frontend
│
├── shopkart-backend/       # Spring Boot Backend
│
└── README.md               # Project Documentation
```

## 🛠️ Technologies Used

### Frontend
- Angular
- TypeScript
- HTML5
- SCSS / CSS
- Bootstrap

### Backend
- Java 17
- Spring Boot
- Spring Data JPA
- Spring Security
- REST APIs
- MySQL
- Maven

### Tools
- IntelliJ IDEA
- Visual Studio Code
- Postman
- Git & GitHub

## ✨ Features

- User Registration and Login
- Product Listing and Management
- Product Search and Categories
- Product Details
- Shopping Cart
- Wishlist
- Order Management
- Order Tracking
- Admin Dashboard
- Product Reviews and Ratings
- Coupon and Discount Management
- Razorpay Payment Integration
- Responsive User Interface

## ⚙️ Installation and Setup

### 1. Clone Repository

```bash
git clone https://github.com/shubham-devkar/shopkart.git
cd shopkart
```

### 2. Backend Setup – Spring Boot

1. Open the `shopkart-backend` folder in IntelliJ IDEA.
2. Configure your MySQL database.
3. Set the required environment variables.
4. Run the Spring Boot application.

Backend URL:

```text
http://localhost:8080
```

For detailed backend configuration, refer to:

`shopkart-backend/README.txt`

### 3. Frontend Setup – Angular

Open PowerShell or terminal inside the Angular folder:

```bash
cd shopkart-angular
npm install
npm start
```

Open the application in your browser:

```text
http://localhost:4200/
```

## 🔗 API Configuration

Backend API base URL:

```text
http://localhost:8080/api
```

The application uses REST APIs to communicate between the Angular frontend and Spring Boot backend.

## 💳 Payment Integration

ShopKart includes Razorpay payment integration.

To enable live payments:
- Configure your own Razorpay Key ID.
- Configure your Razorpay Key Secret using environment variables.
- Implement and verify payment signatures on the backend.

Never expose payment credentials in frontend code or commit secrets to GitHub.

## 🔐 Security

- Passwords and credentials are configured through environment variables.
- JWT secret is kept outside the source code.
- Razorpay credentials are not included in the repository.
- This project is a development starter and is not fully production hardened.

## 👨‍💻 Developer

**Shubham Devkar**

GitHub: https://github.com/shubham-devkar

Project Repository: https://github.com/shubham-devkar/shopkart

---

⭐ Thank you for visiting ShopKart!
