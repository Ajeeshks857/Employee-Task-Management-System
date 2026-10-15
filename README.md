# Employee & Task Management System

MERN stack assignment submission for Roots Media Marketing.

---

## Prerequisites

- **Node.js**: v18.x or later
- **npm**: v9.x or later
- **MongoDB**: Local MongoDB instance (or MongoDB Atlas URI). If local MongoDB is not running, the server automatically starts an in-memory database fallback for local testing.

---

## Configuration

### 1. Backend Configuration (`server/.env`)

Create a file named `.env` inside the `server/` directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/employee_task_management
CLIENT_URL=http://localhost:5173
API_SECURITY_TOKEN=roots-secret-token-2026
```

### 2. Frontend Configuration (`client/.env`)

Create a file named `.env` inside the `client/` directory:

```env
VITE_API_URL=/api
VITE_API_SECURITY_TOKEN=roots-secret-token-2026
```

---

## How to Run

### Step 1: Install Dependencies

From the project root directory, run:

```bash
npm run install:all
```

_(Alternatively, install individually: `npm install`, `cd server && npm install`, `cd ../client && npm install`)_

---

### Step 2: Seed the Database

Populate initial employee and task records:

```bash
npm run seed
```

---

### Step 3: Start the Application

Start both the backend API server and frontend client concurrently:

```bash
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## Available Commands

| Command               | Description                                                         |
| --------------------- | ------------------------------------------------------------------- |
| `npm run install:all` | Installs dependencies for root, server, and client                  |
| `npm run dev`         | Runs both backend (port 5000) and frontend (port 5173) concurrently |
| `npm run seed`        | Seeds database with initial employee and task datasets              |
| `npm test`            | Runs the automated validation test suite (51 checks)                |
| `npm run build`       | Compiles frontend production bundle into `client/dist`              |
| `npm start`           | Starts backend production server                                    |
