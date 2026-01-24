# Smart Split - Backend API

RESTful API for the Expense Tracker application.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your config

# Run development server
npm run dev
```

Server runs at `http://localhost:5000`

## 🔑 Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your-secret-key-min-32-chars
FRONTEND_URL=http://localhost:3000
```

## 📚 API Endpoints

**Auth:**
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

**Expenses:**
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

**Groups:**
- `GET /api/groups` - Get all groups
- `POST /api/groups` - Create group
- `POST /api/groups/:id/members` - Add member

## 📦 Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Bcrypt for passwords

## 🗄️ Database Models

- **User:** name, email, password, avatar, budget
- **Expense:** description, amount, category, splits[]
- **Group:** name, members[], expenses

## 🧪 Testing

```bash
npm test
```