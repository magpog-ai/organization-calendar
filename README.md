# Organization Calendar

A calendar application for organizations to display and manage upcoming events.

## Features

- View upcoming events categorized by group (YoungLife, WyldLife, YLUni)
- Month and week views
- Detailed event information
- Admin authentication for event management
- Firebase database for persistent storage

## Firebase Setup

The application uses Firebase for authentication and database storage. Follow these steps to set up your own Firebase project:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use an existing one)
3. Add a web app to your project
4. Register the app and copy the configuration object
5. Open `src/firebase/config.ts` and replace the placeholder config with your own Firebase configuration


### Setting up Firestore Database

1. In the Firebase Console, go to Firestore Database
2. Create a database (start in test mode for development)
3. Create a collection called `events` (will be created automatically when you add your first event)

## Deploy changes

npm run build
firebase deploy --only hosting

## Using the Application

### Regular Users
- View the calendar and events
- Navigate between months using the Previous and Next buttons
- Toggle between Month and Week views
- Click on events to see details

### Admin Users
- Log in using the "Admin Login" button
- Add new events with the "Add New Event" button
- Edit or delete existing events by clicking on them

## Technologies Used

- React with TypeScript
- Firebase Authentication
- Firestore Database
- react-big-calendar for calendar view
- date-fns for date handling
