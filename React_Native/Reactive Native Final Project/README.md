# Smart Productivity App 🚀

A full-stack React Native application for managing tasks and notes with cloud synchronization.

## ✨ Features

- **User Authentication**: Secure Login/Signup with JWT.
- **Task Management**: Create, edit, delete tasks with priorities (High, Medium, Low).
- **Dashboard & Stats**: Visual overview of your productivity.
- **Filtering**: Quick filters for Pending and Completed tasks.
- **Notes System**: Create standalone notes or link them to specific tasks.
- **Premium UI**: Modern design with a focus on usability and aesthetics.

## 🛠 Tech Stack

- **Frontend**: React Native (Expo), TypeScript, React Navigation, Axios.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose).
- **Auth**: JSON Web Tokens (JWT).

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Expo Go app on your mobile device (for testing)

### Backend Setup
1. `cd backend`
2. `npm install`
3. Configure `.env`:
   ```
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret
   PORT=5000
   ```
4. `npm start` (or `node server.js`)

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. Update `src/api/client.ts` with your local IP if testing on a physical device.
4. `npx expo start`

## 📱 Screens
- **Login/Register**: Secure entry points.
- **Dashboard**: Your task hub.
- **Task Detail**: Add/Edit tasks and manage linked notes.
- **Notes**: A dedicated space for your thoughts.

---
Built with ❤️ for productivity lovers.
