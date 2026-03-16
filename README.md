# 🏦 IndiaBank - Modern Digital Banking System

IndiaBank is a full-stack digital banking application designed to provide a premium and secure experience for managing finances. It features real-time notifications, a professional support chat system, and deep financial analytics.

This project is built using the **MERN Stack** (MongoDB, Express, React, Node.js) and represents a high-quality intermediate level of full-stack development.

---

## ✨ Key Features

### 👤 For Customers
- **Real-Time Alerts**: Get instant toast notifications and sidebar badges when you receive money or get a support reply.
- **Secure Transfers**: Send money to other accounts with instant validation and daily limits.
- **Threaded Support Chat**: Chat directly with bank admins about any issues within a clean conversation window.
- **Bill Payments**: Pay your electricity, water, or internet bills and get instant digital receipts.
- **Fixed Deposits**: Invest your money and watch it grow with interactive charts.

### 🛡️ For Administrators
- **Global Overview**: track total users, active tickets, and bank-wide transactions.
- **Support Management**: Solve customer problems through a real-time messaging interface.
- **System Monitoring**: Keep the bank secure with built-in analytics and status checks.

---

## 🛠️ Technology Used

### **Frontend**
- **React.js**: For a fast and responsive user interface.
- **Vanilla CSS**: Custom styling for a unique, premium "Dark Mode" look.
- **Context API**: Handles global states like "User Login" and "Live Notifications."
- **Lucide Icons**: Clean and modern iconography.

### **Backend**
- **Node.js & Express**: A powerful server to handle all banking logic.
- **MongoDB**: A scalable database to store users, transactions, and messages.
- **JWT (JSON Web Tokens)**: For secure login and data protection.
- **Bcrypt.js**: Advanced encryption for user passwords.

---

## 📸 Screenshots

| Dashboard | Support Chat |
| :--- | :--- |
| ![Dashboard](file:///C:/Users/L/.gemini/antigravity/brain/0216bc3a-5982-413b-bc13-3a937a4ade54/final_verification_toast_dot_1773658760187.png) | ![Chat](file:///C:/Users/L/.gemini/antigravity/brain/0216bc3a-5982-413b-bc13-3a937a4ade54/final_support_chat_verified_1773658790953.png) |

---

## 🚀 Simple Setup (How to Run)

### **1. Setup Backend**
1. Open the `/backend` folder.
2. Run `npm install`.
3. Create a `.env` file with your `MONGO_URI` and `JWT_SECRET`.
4. Run `npm start`.

### **2. Setup Frontend**
1. Open the `/frontend` folder.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open your browser at `http://localhost:5173`.

---

## 💡 Why this is an Intermediate MERN Project?
- **Real-Time Simulation**: Uses a polling system to fetch notifications every 15 seconds without overloading the server.
- **Message Threading**: Stores conversations as nested arrays in MongoDB, optimizing database storage.
- **Custom Auth Middleware**: Protects sensitive banking routes with different access levels for Admin and Users.
- **Premium Design**: Built entirely from scratch with professional CSS animations and glassmorphism.

---

