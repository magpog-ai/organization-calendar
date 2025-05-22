# YoungLife Polska Calendar

A calendar application for YoungLife Polska to display and manage upcoming events across different youth groups.

![YoungLife Polska](public/younglife-polska-logo.svg)

## Features

- View upcoming events categorized by group (YoungLife, WyldLife, YLUni, Joint)
- Month and week views for easy event browsing
- Detailed event information in a clean, modern interface
- Admin authentication for secure event management
- Responsive design for desktop and mobile devices
- Custom YoungLife Polska branding and styling
- Polish language interface

## Tech Stack

- React with TypeScript
- Firebase Authentication and Firestore Database
- react-big-calendar for calendar view
- date-fns for date handling
- Custom CSS with CSS variables for consistent styling

## Color Scheme

The application uses the official YoungLife Polska color scheme:

- YoungLife: Green (`#9BC643`)
- WyldLife: Blue (`#6cb5f0`)
- YLUni: Orange (`#f0af4d`)
- Joint events: Navy (`#3d5575`)
- Primary text: Dark navy (`#2E4057`)

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up Firebase (see below)
4. Start the development server:
   ```
   npm start
   ```

## Firebase Setup

The application uses Firebase for authentication and database storage. Follow these steps to set up your own Firebase project:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use an existing one)
3. Add a web app to your project
4. Register the app and copy the configuration object
5. Create a file at `src/firebase/config.ts` and add your Firebase configuration:

```typescript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Setting up Firestore Database

1. In the Firebase Console, go to Firestore Database
2. Create a database (start in test mode for development)
3. Create a collection called `events` (will be created automatically when you add your first event)

### Adding Admin Users

For security, admin accounts must be added to the Firebase Authentication system. The application includes a utility script for this:

1. Configure your Firebase Admin SDK credentials
2. Run the setup script:
   ```
   node setupAdmins.js
   ```

## Deployment

To deploy the application to Firebase Hosting:

1. Build the production version:
   ```
   npm run build
   ```
2. Deploy to Firebase:
   ```
   firebase deploy --only hosting
   ```

## Using the Application

### Regular Users
- View the calendar and upcoming events
- Navigate between months using the Previous and Next buttons
- Toggle between Month and Week views
- Click on events to see detailed information
- Events are color-coded by group for easy recognition

### Admin Users
- Log in using the "Panel administratora" button
- Add new events with the "Add New Event" button
- Edit or delete existing events by clicking on them
- Manage events for all groups from a single interface

## Directory Structure

- `/src` - Application source code
  - `/components` - React components
  - `/context` - Context providers (Auth, etc.)
  - `/firebase` - Firebase configuration
  - `/styles` - CSS stylesheets
  - `/types` - TypeScript type definitions

## Credits

Developed for YoungLife Polska. Logo and branding colors are property of YoungLife Polska.
