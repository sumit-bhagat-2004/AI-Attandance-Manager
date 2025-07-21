# 🎓 AI Attendance Manager

<div align="center">
  
[![Next.js](https://img.shields.io/badge/Next.js-15.4.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.11-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge)](https://web.dev/progressive-web-apps/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C5CE7?style=for-the-badge)](https://clerk.dev/)

**A comprehensive Progressive Web Application for intelligent student attendance management with AI-powered insights, real-time analytics, and seamless mobile experience.**

[🚀 Live Demo](https://github.com/sumit-bhagat-2004/AI-Attandance-Manager) • [📱 Install PWA](https://github.com/sumit-bhagat-2004/AI-Attandance-Manager) • [🐛 Report Bug](https://github.com/sumit-bhagat-2004/AI-Attandance-Manager/issues)

</div>

---

## ✨ Features

### 🎯 **Core Functionality**
- 🔐 **Secure Authentication** - Clerk-powered user management with email domain validation
- 📅 **Intelligent Scheduling** - Dynamic class schedules with smart attendance tracking
- 📊 **Real-time Analytics** - Comprehensive attendance statistics and performance insights
- 🤖 **AI Integration** - Google Gemini-powered weekly reports and study recommendations
- ⚡ **Smart Makeup System** - Automatic makeup class scheduling for missed mandatory classes
- 📱 **Progressive Web App** - Native app experience with offline support and install prompts

### 🎨 **User Experience**
- 🌐 **Four-View Navigation** - Dedicated full-width views for Schedule, Stats, Makeup, and Calendar
- 📱 **Mobile-First Design** - Fully responsive with touch-optimized interactions
- 🎭 **Beautiful UI** - Modern design with smooth animations and gradient themes
- 🔔 **Smart Notifications** - Real-time alerts for makeup requirements and attendance status
- 🎨 **Dark Theme** - Professional dark mode interface with accessibility features

### 📊 **Advanced Features**
- 📈 **Attendance Predictions** - AI-powered attendance forecasting and recommendations
- 📚 **Study Materials** - Collaborative study notes with AI-generated content
- 🎓 **ECA Management** - Extra-curricular activity tracking and reporting
- 📋 **Weekly Reports** - Automated attendance analysis with actionable insights
- 🏆 **Achievement System** - Gamified attendance tracking with rewards

## 🛠️ Technology Stack

<table>
<tr>
<td><strong>Frontend</strong></td>
<td>Next.js 15.4.2, React 19, Tailwind CSS 4.1.11, Framer Motion</td>
</tr>
<tr>
<td><strong>Backend</strong></td>
<td>Next.js API Routes, Node.js, MongoDB Atlas</td>
</tr>
<tr>
<td><strong>Authentication</strong></td>
<td>Clerk (@clerk/nextjs 6.25.4)</td>
</tr>
<tr>
<td><strong>AI Integration</strong></td>
<td>Google Gemini API</td>
</tr>
<tr>
<td><strong>UI Components</strong></td>
<td>Heroicons, Lucide React, Radix UI, Headless UI</td>
</tr>
<tr>
<td><strong>PWA Features</strong></td>
<td>Service Worker, Web App Manifest, Offline Support</td>
</tr>
<tr>
<td><strong>Animations</strong></td>
<td>Framer Motion, React Confetti</td>
</tr>
</table>

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB Atlas** account
- **Google AI Studio** API key
- **Clerk** account for authentication

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sumit-bhagat-2004/AI-Attandance-Manager.git
   cd AI-Attandance-Manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
   CLERK_SECRET_KEY="your_clerk_secret_key"
   NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
   NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"
   
   # MongoDB Database
   MONGODB_URI="your_mongodb_atlas_connection_string"
   MONGODB_DB="attendanceManager"
   
   # Google Gemini AI
   GEMINI_API_KEY="your_gemini_api_key"
   ```

4. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production build
   npm run build && npm start
   ```

5. **Access the app**
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration Guide

### 📱 Clerk Authentication Setup

1. Create account at [Clerk.dev](https://clerk.dev/)
2. Create new application
3. Configure email domain restrictions (optional)
4. Copy API keys to `.env.local`

### 🗄️ MongoDB Atlas Setup

1. Create account at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create new cluster (free tier available)
3. Configure network access (add your IP)
4. Create database user
5. Get connection string and add to `.env.local`

### 🤖 Google Gemini API Setup

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create new API key
3. Add key to `.env.local`
4. Ensure sufficient quota/credits

## 📱 PWA Installation

### Desktop Installation
- Chrome/Edge: Click install button for native dialog
- Firefox: Click install prompt in address bar
- Safari: Use "Add to Dock" from File menu

### Mobile Installation
- **Android**: Tap "Install" when prompted or via menu
- **iOS**: Share → "Add to Home Screen"

### Features
- ✅ Offline functionality
- ✅ Native app experience
- ✅ Push notifications (future)
- ✅ Background sync
- ✅ App-like navigation

## 🎯 User Guide

### 🏠 Dashboard Navigation

**Four Main Views:**

1. **📅 Schedule View** (Default)
   - Today's class schedule with attendance actions
   - Side panels showing stats and makeup status
   - Smart class categorization (Mandatory/Recommended/Makeup)

2. **📊 Stats View**
   - Comprehensive attendance analytics
   - Subject-wise performance breakdown
   - Visual progress indicators and trends

3. **🔔 Makeup View**
   - Current makeup requirements
   - Available makeup class options
   - Scheduling and confirmation interface

4. **📆 Calendar View**
   - Monthly attendance history
   - Visual attendance patterns
   - Day-specific details modal

### 🎨 Class Color System

- 🔵 **Mandatory Classes (Blue/Cyan)**: Required for 80% attendance
- 🔘 **Recommended Bunks (Gray)**: Safe to skip classes
- 🟢 **Makeup Classes (Green)**: Scheduled compensatory classes
- 🟡 **Pending Makeup (Yellow)**: Classes requiring makeup selection

### 🤖 AI Features

#### Weekly Reports
- Comprehensive attendance analysis
- Performance trends and predictions
- Personalized recommendations
- Academic insights and alerts

#### Study Materials
- Collaborative student notes
- AI-generated study content
- Topic-wise organization
- Export and sharing capabilities

#### Smart Predictions
- Attendance requirement forecasting
- Optimal makeup scheduling
- Performance risk assessment
- Academic planning assistance

## 🔧 Customization

### Adding New Subjects

Edit `lib/scheduleData.js`:

```javascript
// Add new subjects
export const subjects = {
  'CS101': { name: 'Computer Science Fundamentals', room: 'A301' },
  'MATH201': { name: 'Advanced Mathematics', room: 'B205' },
  // Add your subjects here
};

// Update weekly schedule
export const fullSchedule = {
  Monday: [
    { time: '9:00-10:30', subject: 'CS101', type: 'mandatory' },
    // Add schedule entries
  ],
  // Configure other days
};
```

### Modifying Attendance Rules

Edit attendance calculation logic in `lib/utils.js`:

```javascript
// Customize attendance percentage requirements
const ATTENDANCE_REQUIREMENT = 0.8; // 80%
const WARNING_THRESHOLD = 0.75; // 75%
```

### UI Theme Customization

Modify `tailwind.config.js` for custom themes:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'your-color-palette',
      }
    }
  }
}
```

## 🚀 Deployment

### Vercel Deployment

1. Fork the repository
2. Connect to [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy automatically

### Environment Variables for Production

```env
# All development variables plus:
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
CLERK_WEBHOOK_SECRET="your_webhook_secret"
```

### Performance Optimization

- ✅ Next.js SSG/SSR optimization
- ✅ Image optimization with Next/Image
- ✅ Code splitting and lazy loading
- ✅ PWA caching strategies
- ✅ API route optimization

## 🔍 Troubleshooting

### Common Issues

**Authentication Errors**
- Verify Clerk API keys in `.env.local`
- Check domain configuration in Clerk dashboard
- Ensure proper redirect URLs

**Database Connection Issues**
- Verify MongoDB connection string
- Check network access settings in Atlas
- Confirm database user permissions

**AI API Errors**
- Validate Gemini API key
- Check API quota and billing
- Verify network connectivity

**PWA Installation Problems**
- Clear browser cache and service worker
- Verify HTTPS connection
- Check manifest.json validity

**Build/Runtime Errors**
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version compatibility

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md).

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Clerk](https://clerk.dev/) - Authentication platform
- [MongoDB](https://www.mongodb.com/) - Database solution
- [Google AI](https://ai.google.dev/) - AI integration
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library

## 📞 Support

- 🐛 [Report Issues](https://github.com/sumit-bhagat-2004/AI-Attandance-Manager/issues)
- 💬 [Discussions](https://github.com/sumit-bhagat-2004/AI-Attandance-Manager/discussions)
- 📧 Email: [support@example.com](mailto:support@example.com)

---

<div align="center">
  <strong>Made with ❤️ by the AI Attendance Manager Team</strong>
  <br />
  <sub>Star ⭐ this repository if you found it helpful!</sub>
</div>