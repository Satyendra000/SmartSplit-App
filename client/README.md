# 💰 Smart Split - Frontend

A modern, responsive web application for managing personal and shared expenses with beautiful UI/UX built with React, Vite, and Tailwind CSS.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Available Scripts](#available-scripts)
- [Component Documentation](#component-documentation)
- [Responsive Design](#responsive-design)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## ✨ Features

### 🎨 **Beautiful UI/UX**
- Modern dark theme design
- Smooth animations and transitions
- Glassmorphism effects
- Responsive across all devices (mobile, tablet, desktop)
- Touch-friendly interface

### 🔐 **Authentication**
- Secure login and registration
- JWT token-based authentication
- Password reset functionality
- Two-factor authentication (2FA)
- Avatar upload and management

### 💸 **Expense Management**
- Create and track expenses
- Categorize spending (Food, Transport, Entertainment, etc.)
- Personal and shared expense tracking
- Monthly budget setting and monitoring
- Real-time expense statistics

### 👥 **Group & Split Bills**
- Create expense groups
- Add/remove members
- Split bills equally or custom amounts
- Track settlements and balances
- Group activity history

### 📊 **Analytics & Reports**
- Interactive spending charts
- Category breakdown (pie charts)
- Monthly comparison
- Spending trends and patterns
- Expense frequency analysis
- Export data to CSV

### ⚙️ **Settings & Customization**
- Profile management
- Privacy controls
- Security settings
- Data export
- Account deletion

---

## 🛠 Tech Stack

- **Framework:** React 18.2+
- **Build Tool:** Vite 5.0+
- **Styling:** Tailwind CSS 3.3+
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Charts:** Recharts
- **State Management:** React Context API
- **Form Handling:** React Hook Form (optional)
- **Date Utilities:** date-fns
- **Code Quality:** ESLint, Prettier

---

## 📦 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher) or **yarn**
- **Git**

Check versions:
```bash
node --version
npm --version
git --version
```

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/expense-tracker.git
cd expense-tracker/frontend
```

### 2. Install dependencies

```bash
npm install
```

or with yarn:

```bash
yarn install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration (see [Environment Variables](#environment-variables))

---

## 🔐 Environment Variables

Create a `.env` file in the frontend root directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_API_TIMEOUT=10000

# App Configuration
VITE_APP_NAME=Expense Tracker
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development

# Feature Flags
VITE_ENABLE_2FA=true
VITE_ENABLE_ANALYTICS=false

# Optional: Analytics
VITE_GA_TRACKING_ID=your-google-analytics-id

# Optional: Error Tracking
VITE_SENTRY_DSN=your-sentry-dsn
```

### 📝 Notes:
- All variables must start with `VITE_` to be exposed to the app
- Never commit `.env` file to version control
- Use `.env.example` as template

---

## ▶️ Running the Application

### Development Mode

```bash
npm run dev
```

Application will run at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

Built files will be in the `dist/` folder

### Preview Production Build

```bash
npm run preview
```

### Run with Custom Port

```bash
npm run dev -- --port 3001
```
---

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Check for linting errors
npm run lint:fix         # Fix linting errors
npm run format           # Format code with Prettier

# Testing (if configured)
npm run test             # Run tests
npm run test:coverage    # Run tests with coverage

# Analysis
npm run analyze          # Analyze bundle size
```

---

## 🎨 Component Documentation

### **Sidebar Component**
- **Features:**
  - Responsive mobile menu (hamburger)
  - Smooth slide-in animation
  - Active route highlighting
  - User profile display
  - Pro tips section

**Usage:**
```jsx

<Sidebar 
  userName="John Doe"
  userEmail="john@example.com"
  avatar="https://..."
  Index={0}
/>
```

### **BudgetStatus Component**
- **Location:** `src/components/dashboard/BudgetStatus.js`
- **Features:**
  - Monthly budget tracking
  - Progress visualization
  - Budget alerts
  - Set/update budget modal

**Usage:**
```jsx
import { BudgetStatusCard, BudgetSettingsModal } from './components/dashboard/BudgetStatus';

<BudgetStatusCard 
  stats={stats}
  onSetBudget={() => setShowModal(true)}
  refreshTrigger={refreshKey}
/>
```

### **ExpenseFrequency Component**
- **Location:** `src/components/dashboard/ExpenseFreq.js`
- **Features:**
  - Weekly expense count
  - Trend analysis
  - Spending habits
  - Day-wise patterns

### **MonthlyComparison Component**
- **Location:** `src/components/dashboard/MonthlyComp.js`
- **Features:**
  - Month-over-month comparison
  - Percentage change
  - Spending insights

---

## 📱 Responsive Design

### Breakpoints

```javascript
// Tailwind breakpoints
sm:  640px   // Phones (landscape) & small tablets
md:  768px   // Tablets
lg:  1024px  // Laptops (sidebar shows)
xl:  1280px  // Desktops
2xl: 1536px  // Large screens
```

### Mobile Optimizations

- ✅ Touch-friendly buttons (min 44px)
- ✅ Collapsible sidebar
- ✅ Responsive grids
- ✅ Optimized font sizes
- ✅ Horizontal scrolling tables
- ✅ Stacked forms on mobile

### Testing Responsive Design

```bash
# Chrome DevTools
1. Open DevTools (F12)
2. Click device toolbar icon
3. Select device or custom dimensions
4. Test interactions
```

**Recommended Test Devices:**
- iPhone SE (375px)
- iPhone 12/13/14 (390px)
- iPad (768px)
- Desktop (1280px+)

---

## 🎯 Key Features Implementation

### Authentication Flow

```jsx
// Login example
import { authService } from './services/authService';

const handleLogin = async (email, password) => {
  try {
    const response = await authService.login(email, password);
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    navigate('/dashboard');
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Protected Routes

```jsx
import PrivateRoute from './routes/PrivateRoute';

<Routes>
  <Route path="/login" element={<Login />} />
  <Route element={<PrivateRoute />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/expenses" element={<Expenses />} />
  </Route>
</Routes>
```

### API Integration

```jsx
// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## 🚢 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Production deploy
vercel --prod
```

### Deploy to Netlify

```bash
# Build the app
npm run build

# Deploy dist folder via Netlify CLI or drag & drop
```

**netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Deploy to GitHub Pages

```bash
# Install gh-pages
npm install -D gh-pages

# Add to package.json scripts
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"

# Deploy
npm run deploy
```

### Environment Variables in Production

**Vercel:**
- Add env vars in Project Settings → Environment Variables

**Netlify:**
- Add env vars in Site Settings → Build & Deploy → Environment

**GitHub Pages:**
- Use GitHub Secrets for sensitive data

---

## 🐛 Troubleshooting

### Common Issues

#### 1. **Module not found errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 2. **Port already in use**
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- --port 3001
```

#### 3. **Build fails**
```bash
# Check Node version
node --version  # Should be 18+

# Clear Vite cache
rm -rf node_modules/.vite
npm run build
```

#### 4. **API connection issues**
- Check `VITE_API_URL` in `.env`
- Ensure backend is running
- Check CORS settings in backend
- Verify network tab in DevTools

#### 5. **Tailwind styles not working**
```bash
# Rebuild Tailwind
npx tailwindcss -i ./src/styles/index.css -o ./dist/output.css --watch
```

---

## 🎨 Customization

### Change Theme Colors

Edit `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#f97316',    // Orange
        secondary: '#3b82f6',  // Blue
        accent: '#ec4899',     // Pink
      }
    }
  }
}
```

### Custom Fonts

```css
/* src/styles/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  font-family: 'Inter', sans-serif;
}
```

---

## 🔒 Security Best Practices

✅ **Implemented:**
- JWT token storage in localStorage
- Automatic token refresh
- Protected routes
- Input validation
- XSS protection via React
- HTTPS in production

⚠️ **Recommendations:**
- Use httpOnly cookies for tokens (backend)
- Implement CSP headers
- Regular dependency updates
- Environment variable validation
- Rate limiting on forms

---

## 📊 Performance Optimization

- **Code Splitting:** React.lazy() for routes
- **Image Optimization:** WebP format, lazy loading
- **Bundle Analysis:** `npm run analyze`
- **Memoization:** React.memo for expensive components
- **Debouncing:** Search inputs, API calls
- **CDN:** Static assets via Cloudinary/CDN

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Code Style Guidelines

- Use functional components with hooks
- Follow ESLint and Prettier rules
- Write meaningful component names
- Add comments for complex logic
- Use TypeScript (optional but recommended)

---

## 👥 Authors

- **Satyendra Singh** - [GitHub](https://github.com/Satyendra000)

---

## 🙏 Acknowledgments

- React team
- Vite team
- Tailwind CSS team
- Lucide icons

---

## 📞 Support

- Email: smartsplit.noreply@gmail.com

---

## 🗺️ Roadmap

- [ ] Progressive Web App (PWA)
- [ ] Offline support
- [ ] Dark/Light theme toggle
- [ ] Multi-language support (i18n)
- [ ] Advanced data visualization
- [ ] Calendar view for expenses
- [ ] Receipt upload and OCR
- [ ] Voice input for expenses
- [ ] Mobile app (React Native)

---

**Made with ❤️ using React + Tailwind CSS**