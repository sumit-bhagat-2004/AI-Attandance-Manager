# AI Attendance Manager

A comprehensive Next.js application for managing student attendance with AI-powered insights and analytics.

## Features

- 🔐 **User Authentication** - Login and registration system
- 📅 **Smart Scheduling** - Daily schedule view with class timings
- 📊 **Attendance Tracking** - Track attendance with percentage calculations
- 🤖 **AI Integration** - Weekly reports and study plans via Google Gemini
- 📈 **Analytics Dashboard** - Visual attendance statistics
- 📅 **Calendar View** - Monthly calendar showing attendance history
- ⚡ **Makeup Classes** - Smart system for managing missed mandatory classes
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Technology Stack

- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** Next.js API Routes, Node.js
- **Database:** MongoDB
- **AI Integration:** Google Gemini API
- **Icons:** Lucide React

## Prerequisites

Before running this application, make sure you have:

1. **Node.js** (v16 or higher)
2. **MongoDB Atlas** account and connection string
3. **Google AI Studio** API key for Gemini integration

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Update the `.env.local` file in the root directory with your actual credentials:

```env
# Your Google AI Studio API Key
GEMINI_API_KEY="your_actual_gemini_api_key_here"

# Your MongoDB Connection String from MongoDB Atlas
MONGODB_URI="your_mongodb_connection_string_here"

# The name of the database you want to use
MONGODB_DB="attendanceManager"
```

### 3. MongoDB Setup

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string and replace `MONGODB_URI` in `.env.local`
4. The application will automatically create the required collections

### 4. Google Gemini API Setup

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Replace `GEMINI_API_KEY` in `.env.local` with your actual API key

### 5. Run the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm run start
```

The application will be available at `http://localhost:3000`

## Usage

### First Time Setup

1. **Register Account:** Create a new account when you first visit the app
2. **Login:** Use your credentials to access the dashboard
3. **View Schedule:** See today's classes and their timings
4. **Track Attendance:** Mark classes as attended or skipped

### Key Features

#### Attendance Tracking
- **Mandatory Classes:** Classes you must attend to maintain 80% attendance
- **Recommended Bunks:** Classes you can skip based on the weekly cycle
- **Makeup Classes:** When you skip a mandatory class, you must choose a future "recommended bunk" to attend

#### AI Features
- **Weekly Reports:** Generate comprehensive attendance analysis
- **Study Plans:** Get personalized study recommendations
- **Class Topics:** View key topics for any subject

#### Views
- **Schedule View:** Today's classes with attendance actions
- **Calendar View:** Monthly overview of attendance history
- **Stats Panel:** Real-time attendance percentages

## Customization

### Adding New Subjects

Edit `lib/scheduleData.js` to modify:
- `subjects`: Add new subject codes and names
- `fullSchedule`: Update weekly schedule
- `bunkSchedule`: Configure recommended bunk patterns

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Verify your connection string in `.env.local`
   - Ensure your IP is whitelisted in MongoDB Atlas

2. **Gemini API Error**
   - Verify your API key in `.env.local`
   - Ensure you have credits/quota available in Google AI Studio

3. **Build Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Clear Next.js cache: `rm -rf .next`