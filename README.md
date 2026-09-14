# Elite Invitation Management System (EIMS)

An enterprise-grade full-stack web application designed for a College Chairman and authorized Management members to manage high-profile invitation governance, digital scans, priority tracking, member approvals, reports, and audit trails.

---

## 🚀 Active Application URLs

- **Frontend Web Application**: `http://localhost:5175/` (Vite + React 19 + Tailwind CSS)
- **Backend REST API**: `http://localhost:5001/api/v1` (Node.js + Express + Prisma + SQLite)

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS (v4), Lucide React, Context API, Axios, React Router v7 |
| **Backend** | Node.js (v24), Express.js, TypeScript, Prisma ORM (v5), JWT, Bcrypt, Multer, ExcelJS, PDFKit |
| **Database** | SQLite Relational Database (`dev.db` managed via Prisma ORM) |

---

## 📁 Repository Structure

```
eims-app/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # Database Relational Schema
│   ├── src/
│   │   ├── config/              # Prisma Client Configuration
│   │   ├── controllers/         # Auth, User, Invitation, Report, Log, Contact, Reminder Controllers
│   │   ├── middleware/          # JWT Auth, RBAC, Multer File Upload
│   │   ├── routes/              # Express API Endpoint Routes
│   │   ├── utils/               # JWT, Bcrypt, Logger Helpers
│   │   └── index.ts             # Server Entry Point
│   ├── uploads/                 # Storage for scanned images & PDF attachments
│   ├── .env                     # Backend Environment Variables (PORT=5001)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/          # Navbar, Sidebar, Modals, Camera Capture, Cards
│   │   ├── context/             # AuthContext, NotificationContext
│   │   ├── pages/               # PortalSelection, Auth, Chairman, Management Screens
│   │   ├── services/            # Axios API Client
│   │   ├── types/               # TypeScript Interfaces
│   │   ├── App.tsx              # Router & Protection Guards
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## 🏃 How to Run

Both servers are currently running in the background. If you need to restart them manually:

### 1. Start Backend API
```bash
cd backend
npm run dev
# Or node dist/index.js
```
*Backend runs on `http://localhost:5001`.*

### 2. Start Frontend SPA
```bash
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:5175`.*

---

## 🔐 System Architecture & First Launch Flow

1. **First Screen (Portal Selection)**: Contains ONLY TWO main portal options:
   - **Chairman's Portal** (*Executive Control*)
   - **Management Portal** (*Authorized Members*)
2. **First-Time Chairman Setup**: On initial launch, if no Chairman account exists in the database, navigating to Chairman Portal prompts `Create Chairman Account`. Subsequent launches hide setup and enforce authentication. Backend rejects any attempt to register a second Chairman.
3. **Management Approval Gate**: Self-registering management members enter `PENDING` status. Login and dashboard access are strictly blocked until approved by the Chairman.
4. **Role & Priority Isolation**:
   - `IMPORTANT` priority invitations highlight the entire card row with subtle red styling.
   - Management members can only view their own uploaded invitations and cannot accept or reject invitations.
