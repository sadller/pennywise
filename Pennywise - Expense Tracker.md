# Pennywise - Expense Tracker

Pennywise is a modern, collaborative, and mobile-friendly expense tracking app built with a clean UI, strong permission model, and support for rich financial reporting. Designed to help individuals and groups stay on top of their finances, it runs as a PWA for installability and works across web and mobile platforms.

---

## 📊 Tech Stack

### Frontend

* **Framework**: Next.js (React-based)
* **Language**: TypeScript
* **UI Library**: Material UI
* **State Management**: Redux Toolkit
* **PWA**: next-pwa plugin
* **Authentication**: Google OAuth2

### Backend

* **Framework**: FastAPI (Python)
* **Auth Verification**: Google ID Token via `google-auth`
* **API**: RESTful endpoints

### Database

* **Engine**: PostgreSQL
* **Provider**: Supabase (Free Tier)
* **ORM**: SQLAlchemy / Tortoise ORM

### Deployment

* **Frontend**: Vercel
* **Backend**: Render / Railway
* **Database**: Supabase

---

## 🔢 Features

### 1. Month-wise Expense Tracking

* Default to current month
* Navigate forward/backward by month

### 2. Group Management

* Create groups and invite users by Gmail
* Role-based access control (Admin, Member)
* Groups serve as shared containers for transactions

### 3. Quick Date Navigation

* Dropdown/calendar UI to jump to specific month/year

### 4. Minimalist UI

* Clean layout with focus on simplicity
* Two main actions: **"Cash In"** and **"Cash Out"**

### 5. Transaction Form

For **Cash Out** (Expense):

* Amount (required)
* Remark/Note
* Category (dropdown)
* Payment Mode (UPI, cash, card, etc.)
* Buttons: "Save" and "Save & Add New"

### 6. Reports & Analytics

* Generate reports: Weekly, Monthly, Yearly
* Charts and summaries
* Analytics (future): Trends, budget advice

### 7. Settings Panel

* User profile management
* Default currency & time zone
* Group permissions and data export

---

## 📚 Data Models (Simplified)

### User

* id, name, email, google\_id

### Group

* id, name, owner\_id

### GroupMember

* user\_id, group\_id, role (admin/member), permissions

### Transaction

* id, group\_id, user\_id, amount, type (INCOME/EXPENSE), note, category, payment\_mode, date, paid\_by (user who paid)

---

## 🔐 Authentication Flow

1. User logs in with Google (frontend)
2. Google ID token is sent to backend
3. Backend verifies with `google-auth`
4. If valid, backend issues JWT for session handling

---

## 🚷 PWA Support

* Uses `next-pwa` to register service worker
* `manifest.json` defines installable behavior
* Offline support with caching strategies

---

## 🎯 Dev Tools

* Redux DevTools
* React Query Devtools (if needed)
* Pytest (backend)
* Vercel/Render dashboards

---

## ⚙️ Setup & Run

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## ✅ Roadmap

| Phase   | Features                                 |
| ------- | ---------------------------------------- |
| Phase 1 | Auth, Group Create/Join, Add Expense     |
| Phase 2 | Navigation, UI polish, Redux integration |
| Phase 3 | Reports & PWA support                    |
| Phase 4 | Role permissions, data export            |
| Phase 5 | Advanced analytics, mobile optimization  |

---

## 💼 License

MIT License. Built with ❤️ for personal and group financial management.

---

## 🌟 Credits

* Inspired by the principle: "Be **Pennywise**, not Pound Foolish."
* Logo: Owl on a coin, symbolizing wisdom in spending.
