# Devpulse

A production-grade, modular RESTful API built with **Node.js**, **Express**, **TypeScript**, and **PostgreSQL**. The system provides secure authentication, role-based authorization, and comprehensive issue management capabilities following clean architecture principles.

## 🌐 Live URL https://devpulse-three-ashy.vercel.app/

**Production:** 

> Replace the URL above with your actual deployed application URL if different.

---

## 🚀 Features

### Authentication & Security

* User Registration and Login
* JWT-based Authentication
* Access Token & Refresh Token workflow
* Secure password hashing using bcrypt
* HTTP-only cookie support for refresh tokens

### Issue Management

* Create, read, update, and delete issues
* Filter issues by status and type
* Sort issue listings
* Retrieve detailed issue information
* Reporter information included with issues

### Authorization & Access Control

* Role-based authorization system
* **Contributors**

  * Create issues
  * Update only their own issues
  * Can edit issues only when status is `open`
* **Maintainers**

  * Full system access
  * Can update any issue
  * Can delete issues

### Performance & Architecture

* Modular folder structure
* Feature-based architecture
* Optimized database querying
* N+1 query prevention through batch data mapping
* Centralized error handling
* Environment-based configuration

---

## 🛠️ Tech Stack

### Backend

* Node.js (v20+)
* Express.js
* TypeScript

### Database

* PostgreSQL
* pg / Postgres.js

### Authentication & Security

* JSON Web Tokens (JWT)
* bcrypt

### Development Tools

* ts-node-dev
* TypeScript Compiler (tsc)
* dotenv

---

## 📂 Project Structure

```bash
src/
│
├── modules/
│   ├── auth/
│   ├── users/
│   └── issues/
│
├── middlewares/
├── utils/
├── config/
├── routes/
└── app.ts
```

---

## 📊 Database Schema Summary

### Users Table

```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'contributor',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Issues Table

```sql
CREATE TABLE IF NOT EXISTS issues (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    reporter_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Entity Relationship

```text
users
  │
  └── id
       │
       ▼
issues.reporter_id
```

---

## 🗺️ API Endpoints

### Authentication

| Method | Endpoint           | Access | Description                  |
| ------ | ------------------ | ------ | ---------------------------- |
| POST   | `/api/auth/signup` | Public | Register a new user          |
| POST   | `/api/auth/login`  | Public | Login and receive JWT tokens |

---

### Issues

| Method | Endpoint          | Access          | Description        |
| ------ | ----------------- | --------------- | ------------------ |
| POST   | `/api/issues`     | Authenticated   | Create a new issue |
| GET    | `/api/issues`     | Public          | Get all issues     |
| GET    | `/api/issues/:id` | Public          | Get a single issue |
| PATCH  | `/api/issues/:id` | Conditional     | Update an issue    |
| DELETE | `/api/issues/:id` | Maintainer Only | Delete an issue    |

---

## Query Parameters

### Get All Issues

```http
GET /api/issues?status=open&type=bug&sort=created_at
```

Supported Filters:

| Parameter | Example    |
| --------- | ---------- |
| status    | open       |
| type      | bug        |
| sort      | created_at |

---

## ⚙️ Local Setup

### 1. Clone Repository

```bash
git clone https://github.com/Muaj-Chowdhury/devpulse.git

cd devpulse
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Configure Environment Variables

Create a `.env` file in the root directory.

```env
PORT=5000
NODE_ENV=development

DATABASE_URL=postgres://username:password@localhost:5432/devpulse_db

JWT_SECRET=your_super_secure_access_token_secret_key_123

JWT_REFRESH_SECRET=your_super_secure_refresh_token_secret_key_456
```

---

### 4. Create Database

Create a PostgreSQL database named:

```sql
issue_tracker_db
```

Run the schema scripts to create the required tables.

---

### 5. Run Development Server

```bash
npm run dev
```

Application will be available at:

```text
http://localhost:5000
```

---

### 6. Build for Production

```bash
npm run build
```

---

### 7. Start Production Server

```bash
npm start
```

---

## 🔒 Authorization Rules

### Contributor

✅ Create issues

✅ View issues

✅ Update own issues when status is `open`

❌ Delete issues

❌ Update other users' issues

---

### Maintainer

✅ Full access to all resources

✅ Update any issue

✅ Delete any issue

---

## ❌ Error Handling

The API includes centralized error handling for:

* Validation Errors
* Authentication Errors
* Authorization Errors
* Database Errors
* Internal Server Errors

Production environments hide internal implementation details while development environments expose useful debugging information.

---

## 📦 Available Scripts

```bash
npm run dev      # Development server

npm run build    # Build TypeScript

npm start        # Run production build
```

---

## 📜 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Developed using Node.js, Express, TypeScript, and PostgreSQL following modern backend development practices and clean architecture principles.
