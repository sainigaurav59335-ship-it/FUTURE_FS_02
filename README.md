# CRM - Client Lead Management System

CRM is a full-stack Client Lead Management System (Mini CRM) built using the MERN stack (MongoDB, Express.js, React.js, Node.js). It features a modern glassmorphic dashboard, interactive analytics charts, admin authentication (JWT), and detail profile screens for managing lead statuses, notes, reminders, and historical audit logs.

## 🚀 Features

- **Analytics Dashboard**: Interactive charts displaying lead trends (last 30 days), lead funnel stages (donut chart), and lead acquisition sources (bar chart).
- **KPI Summary Cards**: Real-time stats for Total Leads, New Leads, Converted Leads, and Conversion Rate.
- **Lead Database**: Searchable, sortable, and status/source-filterable leads table.
- **Full Lead CRUD**: Create, read, update, and delete leads.
- **Interactive Lead Profiles**:
  - Funnel stage management (New, Contacted, Qualified, Converted, Lost).
  - Client Notes feed (add, view note timeline).
  - Reminders Checklist (set follow-ups with due dates, check off completed tasks).
  - Audit Activity History (automatically logs actions on leads).
- **Secure Authentication**: JWT-based secure sign-up, login, and route guarding.
- **Public Website Integration**: Unauthenticated endpoint `POST /api/leads/public` allowing contact forms on external websites to automatically import leads.
- **Modern Glassmorphic UI**: Tailored HSL color system, smooth hover transformations, responsive tables, and clean inputs.

---

## 🛠️ Project Structure

```
├── backend/
│   ├── config/db.js          # MongoDB database connection
│   ├── controllers/          # Business logic handlers
│   ├── middleware/           # Auth JWT router protection
│   ├── models/               # Mongoose lead and user schemas
│   ├── routes/               # API route definitions
│   ├── .env                  # Environmental configurations
│   ├── seed.js               # Mock database seeder
│   ├── server.js             # Main server runner
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/       # Reusable components (Navbar, ProtectedRoute)
    │   ├── context/          # Auth global context provider
    │   ├── pages/            # View pages (Login, Register, Dashboard, LeadProfile)
    │   ├── services/         # API request client
    │   ├── App.jsx           # Main routing entry
    │   ├── index.css         # Glassmorphic style design framework
    │   └── main.jsx          # React runner
    ├── index.html
    └── package.json
```

---

## ⚙️ Setup & Installation

### Prerequisites

Ensure you have **Node.js** (v18+) and **MongoDB** installed and running on your system.

### 1. Database Seeding & Backend Configuration

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create or adjust the `.env` file (already initialized with default parameters):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/mini-crm
   JWT_SECRET=supersecretcrmtokenkey12345!@#$%
   NODE_ENV=development
   ```
3. Run the database seeding script to insert 10 mock leads and create the default admin user:
   ```bash
   node seed.js
   ```
   *Verify your MongoDB instance is running locally on port `27017` before running.*

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server runs at [http://localhost:5000](http://localhost:5000).*

### 2. Frontend Configuration

1. Open a separate terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *The client application launches at [http://localhost:5173](http://localhost:5173).*

---

## 🔐 Default Credentials

Use these credentials to sign in to the administrative panel immediately after seeding the database:

- **Email**: `admin@crm.com`
- **Password**: `password123`

You can also use the **Create account** link on the login page to register a new admin user.

---

## 🔌 API Documentation

### Public Endpoints

#### Submit Lead from External Website Form
- **Endpoint**: `POST /api/leads/public`
- **Request Body**:
  ```json
  {
    "name": "Bruce Banner",
    "email": "banner@avengers.org",
    "phone": "555-473-3600",
    "source": "Landing Page Form",
    "message": "Interested in database scaling consultation."
  }
  ```

### Protected Endpoints (Requires `Authorization: Bearer <JWT_Token>` Header)

#### Authentication
- `POST /api/auth/register` - Register a new administrator.
- `POST /api/auth/login` - Authenticate admin and return token.
- `GET /api/auth/me` - Fetch current user profile.

#### Leads
- `GET /api/leads` - Get leads list (Supports query parameters `search`, `status`, `source`, `sort`).
- `POST /api/leads` - Manually create a new lead.
- `GET /api/leads/:id` - Fetch single lead details.
- `PUT /api/leads/:id` - Update lead details (or status).
- `DELETE /api/leads/:id` - Delete a lead.
- `GET /api/leads/stats` - Fetch dashboard statistics and chart datasets.

#### Notes & Reminders
- `POST /api/leads/:id/notes` - Add a text note to a lead.
- `POST /api/leads/:id/reminders` - Set a follow-up reminder.
- `PUT /api/leads/:id/reminders/:reminderId` - Toggle reminder completed check status.
