# 📇 ProContact: Full-Stack Contact Management System

A high-performance, responsive web application built with the **MERN stack** (MongoDB, Express, React, Node.js). This project was developed as part of a technical assignment to demonstrate full-stack proficiency, secure authentication, and modern UI/UX principles.

---

## 🚀 Live Demo
- **Frontend:** [Your Vercel URL Here]
- **Backend API:** [Your Render URL Here]

---

## ✨ Key Features

### 🔐 Secure Authentication
- **JWT Implementation:** Full registration and login flow with JSON Web Tokens.
- **Private Data:** Contacts are strictly tied to the authenticated user; no cross-user data access.
- **Password Hashing:** Industry-standard security using `bcryptjs`.

### 📂 Contact Management
- **Full CRUD:** Create, Read, Update, and Delete contacts seamlessly.
- **Categorization:** Organize contacts into **Work, Family, Friends, or General**.
- **Favorites:** Star important contacts for quick access.

### 🔍 Advanced UX
- **Live Search:** Filter through hundreds of contacts instantly by name, email, or phone.
- **Category Filtering:** View contacts by specific groups.
- **vCard QR Codes:** Generate a QR code for any contact to instantly scan and save to a mobile device.

### 📤 Data Portability
- **Bulk Import:** Upload multiple contacts at once via CSV files.
- **Export to CSV:** Download your entire contact list for offline backup.

---

## 🛠️ Tech Stack

**Frontend:**
* **React 18** (Vite for fast bundling)
* **Tailwind CSS** (Utility-first styling)
* **Lucide React** (Modern iconography)
* **Axios** (API communication)
* **QRCode.react** (vCard generation)

**Backend:**
* **Node.js & Express** (RESTful API)
* **MongoDB & Mongoose** (NoSQL Database & Modeling)
* **JWT** (Stateless authentication)
* **Dotenv** (Environment variable management)

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/contact-manager.git](https://github.com/your-username/contact-manager.git)
cd contact-manager
```
## 2. Backend Setup
```bash
cd backend
npm install
```

## Create a .env file in the backend folder:

```Code snippet
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
```


## 3. Frontend Setup
```Bash
cd ../frontend
npm install
```

Update the API_URL in src/App.jsx to http://localhost:5000/api.

## 4. Run Locally
```bash Terminal 1 (Backend):
npm start (or node server.js)
```

```bash Terminal 2 (Frontend):
npm run dev
```
