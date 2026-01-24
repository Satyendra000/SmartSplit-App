# 💰 Smart Split

A modern, full-stack web application for managing personal and shared expenses with real-time analytics, group bill splitting, and budget tracking.

![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18.2.0-blue)

## ✨ Features

### 💸 **Expense Management**
- ✅ Create, edit, and delete expenses
- ✅ Categorize expenses (Food, Transport, Shopping, etc.)
- ✅ Track personal and shared expenses
- ✅ Monthly budget monitoring
- ✅ Expense filtering and search

### 👥 **Group & Split Bills**
- ✅ Create expense groups
- ✅ Add/remove members
- ✅ Split bills equally or custom amounts
- ✅ Track who owes whom
- ✅ Settlement history

### 📊 **Analytics & Reports**
- ✅ Interactive spending charts
- ✅ Category breakdown
- ✅ Monthly comparisons
- ✅ Spending trends
- ✅ Export to CSV

### 🎨 **Modern UI/UX**
- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Dark theme with glassmorphism
- ✅ Smooth animations
- ✅ Touch-friendly interface

### 🔐 **Security**
- ✅ JWT authentication
- ✅ Password encryption
- ✅ Two-factor authentication (2FA)
- ✅ Secure password reset

---

## 🛠 Tech Stack

### **Frontend**
- React 18.2
- Vite 5.0
- Tailwind CSS 3.3
- React Router v6
- Axios
- Lucide React (icons)
- Recharts (charts)

### **Backend**
- Node.js 18+
- Express.js 4.18
- MongoDB + Mongoose
- JWT Authentication
- Bcrypt
- Nodemailer

---

## 📦 Project Structure

```
expense-tracker/
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   └── package.json
│
├── backend/            # Node.js API server
│   ├── src/
│   │   ├── models/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── ...
│   └── package.json
└── README.md          # This file
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/expense-tracker.git
cd expense-tracker
```

2. **Set up Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

Backend runs at `http://localhost:5000`

3. **Set up Frontend** (in a new terminal)
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## 🔐 Environment Variables

### Backend `.env`
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your-super-secret-key-min-32-characters
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Expense Tracker
```

---

## 📚 Documentation

- **[Frontend Documentation](./frontend/README.md)** - React app setup and components
- **[Backend Documentation](./backend/README.md)** - API endpoints and database schema
---

## 🎯 Key Features Demo

### Dashboard
- Real-time expense statistics
- Monthly spending trends
- Category breakdown pie chart
- Recent activity feed
- Budget status monitoring

### Expense Management
- Quick add expense
- Filter by category, date, type
- Search functionality
- Export to CSV
- Bulk operations

### Group Bill Splitting
- Create groups for trips, households, events
- Add members via email
- Split bills equally or custom amounts
- Track settlements
- Group activity history

### Reports & Analytics
- Weekly/monthly spending trends
- Category-wise analysis
- Spending patterns by day
- Month-over-month comparison
- Top merchants tracking

---

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Groups
- `GET /api/groups` - Get all groups
- `POST /api/groups` - Create group
- `POST /api/groups/:id/members` - Add member

*For complete API documentation, see [Backend README](./backend/README.md)*

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests (if configured)
cd frontend
npm test
```

---

## 🚢 Deployment

### Backend (Heroku/Railway/Render)
```bash
cd backend
# Set environment variables in your platform
# Deploy via Git or CLI
```

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

### Docker (Optional)
```bash
docker-compose up
```

---

## 📱 Responsive Design

Fully optimized for:
- 📱 Mobile (320px - 640px)
- 📱 Tablet (640px - 1024px)
- 💻 Desktop (1024px+)

---

## 👥 Authors

- **Satyendra Singh** - [GitHub](https://github.com/Satyendra000) | [LinkedIn](https://www.linkedin.com/in/satyendra-pratap-singh-67a9a028a)

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
---

## 📞 Support

- 📧 Email: smartsplit.noreply@gmail.com

---

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

**Made with ❤️ by [Satyendra Singh]**

---