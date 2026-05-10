# 🚀 EduFlow — Setup Guide (Start Here)

## Common Issue: Can't Login or Register?

The most likely causes and fixes:

---

### 1. Missing `.env` file (most common cause)

The backend **will not work** without a `.env` file. Create one:

```bash
cd backend
cp .env.example .env
```

Then open `backend/.env` and make sure at minimum these two lines are set:

```
MONGO_URI=mongodb://127.0.0.1:27017/eduflow
JWT_SECRET=any_long_random_string_here
```

---

### 2. MongoDB not running

Make sure MongoDB is running locally:

```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod

# Windows
net start MongoDB
```

Or use a free **MongoDB Atlas** cloud database — get a connection string at https://www.mongodb.com/atlas and put it in `MONGO_URI`.

---

### 3. "Email already exists" on Register

This means MongoDB already has a user with that email (from a previous seed or registration attempt). Either:
- Use a different email address, OR
- Clear the database: `use eduflow; db.users.deleteMany({})` in `mongosh`

---

### 4. Server crashes on startup

Check the terminal where you ran `npm run dev`. Common errors:
- `MongooseError: URI must be a string` → `.env` file missing or `MONGO_URI` not set
- `Error: secretOrPrivateKey must have a value` → `JWT_SECRET` not set in `.env`

Stripe and AWS errors are **safe to ignore** — they won't block login/register.

---

## Full Setup Steps

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Create your .env (REQUIRED)
cp .env.example .env
# Edit .env — set MONGO_URI and JWT_SECRET

# 3. Install frontend dependencies
cd ../frontend
npm install

# 4. (Optional but recommended) Seed the database with sample courses
cd ../backend
node seed.js

# 5. Start the backend (in one terminal)
cd backend
npm run dev
# Should print: ✅ Server running on http://localhost:5000

# 6. Start the frontend (in another terminal)
cd frontend
npm run dev
# Open http://localhost:5173
```

## Test Accounts (after running seed.js)

| Role | Email | Password |
|------|-------|----------|
| Student | student@eduflow.dev | password123 |
| Instructor | sarah@eduflow.dev | password123 |
| Instructor | marcus@eduflow.dev | password123 |
| Instructor | priya@eduflow.dev | password123 |
| Admin | admin@eduflow.dev | admin123 |

## Can't use test accounts? Re-run the seed

```bash
cd backend
node seed.js
```

This will recreate all the test accounts even if they exist.
