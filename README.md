# YoungLife Polska Calendar

A modern, bilingual calendar application for YoungLife Polska to display and manage upcoming events across different youth groups (YoungLife, WyldLife, YLUni, and Inne). The application features admin authentication, event management, and a responsive design for both desktop and mobile devices.

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Project Structure](#project-structure)
- [Usage Guide](#usage-guide)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Tech Stack](#tech-stack)

## ✨ Features

### For All Users
- 📅 **Calendar Views**: Month and week views for easy event browsing
- 🎨 **Color-Coded Events**: Events are visually distinguished by group
- 🌐 **Bilingual Interface**: Polish and English language support
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- 🔍 **Event Filtering**: Filter events by group (YoungLife, WyldLife, YLUni, Inne)
- 📝 **Event Details**: Click on any event to see full details including description, location, and links

### For Admin Users
- 🔐 **Secure Authentication**: Firebase-based admin login system
- ➕ **Add Events**: Create new events with full details
- ✏️ **Edit Events**: Update existing event information
- 🗑️ **Delete Events**: Remove events from the calendar
- 👥 **Contact Work Management**: Manage contact work entries with recurring event support
- 📊 **Two Calendar Types**: 
  - **Events Calendar**: Regular events and activities
  - **Contact Work Calendar**: Track contact work with recurring patterns

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Firebase Account** - [Sign up](https://firebase.google.com/)
- **Git** (for cloning the repository)

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd organization-calendar
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your Firebase credentials (see Detailed Setup below)
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   - The app will automatically open at `http://localhost:3000`
   - If it doesn't, navigate to that URL manually

## 📖 Detailed Setup

### Step 1: Firebase Project Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project

### Step 2: Create a Web App

1. In your Firebase project, click the web icon (`</>`) to add a web app
2. Register your app with a nickname (e.g., "YoungLife Calendar")
3. Copy the Firebase configuration object that appears

### Step 3: Configure Environment Variables

1. **Create `.env` file** in the project root directory:
   ```bash
   cp .env.example .env
   ```

2. **Open `.env`** and fill in your Firebase credentials:
   ```env
   REACT_APP_FIREBASE_API_KEY=your_api_key_here
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

   **Where to find these values:**
   - In Firebase Console → Project Settings → Your apps → Web app config
   - Copy each value from the `firebaseConfig` object

3. **Important Security Note:**
   - The `.env` file is already in `.gitignore` and will NOT be committed
   - Never share your `.env` file or commit it to version control
   - Each developer needs their own `.env` file with their Firebase credentials

### Step 4: Set Up Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development) or **Production mode** (for production)
4. Select a location for your database
5. The `events` and `contactWork` collections will be created automatically when you add your first entry

### Step 5: Set Up Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get started**
3. Enable **Email/Password** authentication provider
4. Click **Save**

### Step 6: Add Admin Users

Admin users must be added to Firestore for security:

1. In Firebase Console, go to **Firestore Database**
2. Create a collection named `admins`
3. Add a document with the admin's email address as the document ID
4. The document can be empty (the app checks if the document exists)

**Example:**
- Collection: `admins`
- Document ID: `admin@example.com` (the email address)
- Fields: (none required, but you can add metadata if needed)

**Note:** Only users whose email exists in the `admins` collection will have admin privileges.

### Step 7: Verify Setup

1. Start the development server:
   ```bash
   npm start
   ```

2. Check the browser console for any errors
3. If you see "Missing required Firebase environment variables", double-check your `.env` file
4. Try logging in with an admin account to verify authentication works

## 📁 Project Structure

```
organization-calendar/
├── public/                 # Static files (HTML, images, etc.)
├── src/
│   ├── components/         # React components
│   │   ├── Calendar.tsx           # Main events calendar
│   │   ├── ContactWorkCalendar.tsx # Contact work calendar
│   │   ├── EventForm.tsx           # Event creation/editing form
│   │   ├── ContactWorkForm.tsx    # Contact work form
│   │   ├── NavBar.tsx              # Navigation bar
│   │   ├── Login.tsx                # Login component
│   │   ├── LanguageSwitcher.tsx    # Language toggle
│   │   └── CustomToolbar.tsx       # Calendar toolbar
│   ├── context/            # React Context providers
│   │   └── AuthContext.tsx         # Authentication context
│   ├── firebase/           # Firebase configuration and services
│   │   ├── config.ts               # Firebase initialization
│   │   ├── eventService.ts         # Event CRUD operations
│   │   └── contactWorkService.ts   # Contact work CRUD operations
│   ├── styles/             # CSS stylesheets
│   │   ├── Calendar.css
│   │   ├── ContactWork.css
│   │   ├── NavBar.css
│   │   └── ...
│   ├── types/              # TypeScript type definitions
│   │   ├── events.ts
│   │   └── contactWork.ts
│   ├── i18n/               # Internationalization
│   │   ├── index.ts
│   │   └── locales/        # Translation files
│   ├── data/               # Mock data (fallback)
│   │   └── mockEvents.ts
│   ├── App.tsx             # Main application component
│   └── index.tsx           # Application entry point
├── .env                    # Environment variables (NOT committed)
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── firebase.json           # Firebase configuration
├── firestore.rules         # Firestore security rules
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## 📱 Usage Guide

### For Regular Users

1. **Viewing Events**
   - The calendar opens in month view by default
   - Use the navigation buttons to move between months
   - Click on any event to see detailed information
   - Use the filter checkboxes to show/hide specific groups

2. **Switching Views**
   - Click "Month" or "Week" in the calendar toolbar to switch views
   - Use the "Today" button to jump to the current date

3. **Language Selection**
   - Click "PL" or "ENG" in the top navigation to switch languages
   - The entire interface will update immediately

### For Admin Users

1. **Logging In**
   - Click "Panel administratora" (Admin Panel) in the navigation
   - Enter your admin email and password
   - You must be registered in Firebase Authentication and Firestore `admins` collection

2. **Adding Events**
   - Click the "Add Event" button (appears when logged in as admin)
   - Fill in the event form:
     - Title (required)
     - Group selection (YoungLife, WyldLife, YLUni, Inne, or Joint)
     - Start date and time
     - End date and time
     - Location (required)
     - Description (required)
     - URL (optional, for external links)
   - Click "Submit" to save

3. **Editing Events**
   - Click on an event to open the details modal
   - Click the "Edit" button
   - Modify the event information
   - Click "Update" to save changes

4. **Deleting Events**
   - Click on an event to open the details modal
   - Click the "Delete" button
   - Confirm the deletion

5. **Contact Work Calendar**
   - Switch to the "Contact Work" tab
   - Add recurring contact work entries
   - Set up weekly, biweekly, or monthly patterns
   - Manage individual occurrences or entire series

## 🚢 Deployment

### Building for Production

1. **Build the application**
   ```bash
   npm run build
   ```
   This creates an optimized production build in the `build/` directory.

2. **Test the production build locally**
   ```bash
   npx serve -s build
   ```
   Visit `http://localhost:3000` to verify everything works.

### Deploying to Firebase Hosting

1. **Install Firebase CLI** (if not already installed)
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase** (if not already done)
   ```bash
   firebase init
   ```
   - Select "Hosting"
   - Choose your Firebase project
   - Set public directory to `build`
   - Configure as single-page app: Yes
   - Set up automatic builds: Yes (optional)

4. **Deploy**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

5. **Your app will be live at:**
   ```
   https://your-project-id.web.app
   ```

### Environment Variables in Production

For production deployment, set environment variables in your hosting platform:

- **Firebase Hosting**: Use Firebase Hosting environment variables in Firebase Console
- **Other platforms**: Set `REACT_APP_*` variables in their environment settings

**Note:** After changing environment variables, rebuild and redeploy:
```bash
npm run build
firebase deploy --only hosting
```

## 🔍 Troubleshooting

### Common Issues

#### "Missing required Firebase environment variables"
- **Solution**: Check that your `.env` file exists in the project root
- Verify all `REACT_APP_*` variables are set correctly
- Restart the development server after creating/editing `.env`

#### "Firebase: Error (auth/invalid-api-key)"
- **Solution**: Verify your `REACT_APP_FIREBASE_API_KEY` in `.env` matches Firebase Console
- Make sure there are no extra spaces or quotes around the values

#### "Cannot read property 'collection' of undefined"
- **Solution**: Firebase isn't initializing properly
- Check browser console for Firebase initialization errors
- Verify all environment variables are correct

#### Admin login not working
- **Solution**: 
  1. Verify the user exists in Firebase Authentication
  2. Check that the user's email exists as a document ID in Firestore `admins` collection
  3. Verify Firestore security rules allow reading the `admins` collection

#### Events not loading
- **Solution**:
  1. Check Firestore database has an `events` collection
  2. Verify Firestore security rules allow reading events
  3. Check browser console for specific error messages

#### Build fails
- **Solution**:
  1. Delete `node_modules` and `package-lock.json`
  2. Run `npm install` again
  3. Clear npm cache: `npm cache clean --force`
  4. Try building again: `npm run build`

### Getting Help

If you encounter issues not listed here:

1. Check the browser console for error messages
2. Check the terminal where `npm start` is running for build errors
3. Verify all setup steps were completed correctly
4. Ensure your Firebase project is properly configured

## 🛠️ Tech Stack

### Core Technologies
- **React 19.1.0** - UI library
- **TypeScript 4.9.5** - Type safety
- **React Scripts 5.0.1** - Build tooling

### Key Libraries
- **Firebase 8.10.0** - Backend (Authentication & Firestore)
- **react-big-calendar 1.18.0** - Calendar component
- **react-i18next 15.5.2** - Internationalization
- **date-fns 4.1.0** - Date utilities (Events calendar)
- **moment 2.30.1** - Date utilities (Contact Work calendar)

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **Web Vitals** - Performance monitoring

## 🎨 Color Scheme

The application uses the official YoungLife Polska color scheme:

| Group | Color | Hex Code |
|-------|-------|----------|
| YoungLife | Green | `#9BC643` |
| WyldLife | Blue | `#6cb5f0` |
| YLUni | Orange | `#f0af4d` |
| Inne | Dark Green | `#5a7428` |
| Joint Events | Navy | `#3d5575` |
| Primary Text | Dark Navy | `#2E4057` |

## 📝 Available Scripts

- `npm start` - Start development server (runs on http://localhost:3000)
- `npm run build` - Create production build
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (irreversible)

## 🔒 Security Notes

- Environment variables containing Firebase credentials are stored in `.env` (not committed)
- Admin access is controlled via Firestore `admins` collection
- Firestore security rules restrict write access to authenticated admins only
- Never commit `.env` file or expose Firebase credentials publicly

## 📄 License

This project is private and proprietary to YoungLife Polska.

## 👥 Credits

Developed for YoungLife Polska. Logo and branding colors are property of YoungLife Polska.

---

**Need help?** Check the [Troubleshooting](#troubleshooting) section or review the setup steps carefully.
