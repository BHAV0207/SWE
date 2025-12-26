# Campus FixIt

Campus FixIt is a full-stack mobile application designed to help students and staff report and track maintenance issues on campus. The application consists of a React Native frontend built with Expo and a Node.js/Express backend using MongoDB.

## Features

- **Issue Reporting**: Users can report maintenance issues with details.
- **Image Upload**: internal support for uploading images of the reported issues (using `multer` and `expo-image-picker`).
- **Authentication**: Secure user login and registration using JWT and bcrypt.
- **REST API**: Backend API handling data persistence and business logic.

## Tech Stack

### Frontend (Mobile)
- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- **Navigation**: [React Navigation](https://reactnavigation.org/) (Stack & Bottom Tabs) & [Expo Router](https://docs.expo.dev/router/introduction/)
- **Styling**: Standard React Native StyleSheet / Expo constants
- **State/Network**: React Hooks, Context API (implied)

### Backend (Server)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs
- **File Handling**: Multer

## Prerequisites

- Node.js (LTS version recommended)
- npm or yarn
- MongoDB Atlas account or local MongoDB instance
- Expo Go app on your physical device (or Android Studio/Xcode for simulators)

## Installation & Setup

### 1. Backend Setup

The backend handles API requests and database connections.

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  **Environment Configuration**:  
    Create a `.env` file in the `backend` directory with the following variables:
    ```env
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    PORT=5000
    ```

4.  Start the server:
    ```bash
    npm run dev
    ```
    The server will typically run on `http://localhost:5000`.

### 2. Frontend Setup

The frontend is the mobile interface for the application.

1.  Navigate back to the project root:
    ```bash
    cd ..
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the Expo development server:
    ```bash
    npx expo start
    ```

4.  **Run on Device/Emulator**:
    - **Physical Device**: Scan the QR code using the **Expo Go** app (available on App Store/Play Store).
    - **Emulator**: Press `a` for Android Emulator or `i` for iOS Simulator (requires setup).

## Project Structure

```
campus-fix/
├── app/                  # Expo Router app directory
├── assets/               # Static assets (images, fonts)
├── backend/              # Node.js/Express backend
│   ├── server.js         # Entry point
│   ├── .env              # Environment variables (create this)
│   └── package.json
├── components/           # Reusable UI components
├── constants/            # App-wide constants (colors, layout)
├── context/              # React Context for state management
├── hooks/                # Custom React hooks
├── navigation/           # Navigation configuration
├── screens/              # Screen components (if not using file-based routing entirely)
├── App.js                # Main application entry
└── package.json          # Frontend dependencies
```

## Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.
