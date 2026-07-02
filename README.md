# Admin Panel V4 — Bulk Client Records + Card-Based Form Filling

A complete system where:
1. Admin uploads ONE Excel file with up to 700+ client records
2. Each user signs up → accepts Terms & Conditions → uploads signature → waits for admin verification
3. Once verified, the user fills records ONE CARD AT A TIME (auto-advances to the next after each submission)
4. Admin can see every filled record, track user progress, and verify signatures

---

## Tech Stack
React, Node.js, Express, MongoDB, JWT Auth, Multer + XLSX (for Excel uploads)

---

## Setup

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env   # edit MONGODB_URI + JWT_SECRET
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
npm start
```

### 3. Create Admin (one time)
```powershell
$body = '{"setupKey":"admin_setup_secret_2024","username":"admin","email":"admin@gmail.com","password":"admin123","fullName":"System Administrator"}'
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/setup-admin" -Method POST -ContentType "application/json" -Body $body
```

---

## How It Works

### Admin Flow
1. Login → **Forms & Verification**
2. Click **Upload Excel** → select the .xlsx file with columns: Name, Unique Number, Monthly Income, Address, Contact Details
3. All rows are added to the pool as "unassigned" records
4. Go to **Users** → create user accounts → give credentials to users
5. As users complete the Terms+Signature step, they appear in the **Signature Verification** tab — click Verify or Reject
6. Track each user's fill progress in the **User Progress** tab
7. See every filled record in the **Filled Records** tab

### User Flow
1. Login → **My Form**
2. Read Terms & Conditions → check the agreement box
3. Upload a photo of handwritten signature → submit
4. Wait for admin verification (shows "Pending" status)
5. Once verified: a card appears showing one client's id/name/amount/phone/address
6. User fills the form below the card with matching details → clicks Submit
7. **The next card automatically loads** — repeats until all assigned records are done
8. Progress bar shows how many completed out of total

---

## Excel File Format

The uploaded Excel must have these columns (header names are flexible — partial matches work):
| Name | unique number | Monthly income | ADDRESS | contact details |
|------|---------------|-----------------|---------|------------------|
| Liam | DVC16283@tyi | 7300.1 | 720 19th Street... | 2120089865 |

---

## Key API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/forms/records/upload | Admin uploads Excel (multipart) |
| GET | /api/forms/records/current | User gets their current card |
| POST | /api/forms/records/:id/submit | User submits filled card |
| GET | /api/forms/records/my-progress | User's completion stats |
| GET | /api/forms/records/progress | Admin: all users' progress |
| GET | /api/forms/records/filled | Admin: all filled records |
| POST | /api/forms/verification/accept-terms | User accepts terms + uploads signature |
| GET | /api/forms/verification/all | Admin: all verification requests |
| PATCH | /api/forms/verification/:id/verify | Admin verifies/rejects signature |
