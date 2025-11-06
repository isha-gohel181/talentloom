# Talentloom

Talentloom is a full-stack web application designed as a platform for talent discovery and community engagement. It allows users to create posts, engage in discussions through replies, and manage user profiles. The platform includes admin functionalities for moderation and oversight.

## Tech Stack

### Backend
- **Node.js** with **Express.js** for the server
- **MongoDB** with **Mongoose** for database
- **JWT** for authentication
- **Cloudinary** for media uploads
- **Nodemailer** for email services

### Frontend
- **React** with **Vite** for fast development
- **Redux Toolkit** for state management
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/vivek-dubey-0305/talentloom.git
   cd talentloom
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```
   cd ../frontend
   npm install
   ```

## Running the Project

1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```
   The backend will run on `http://localhost:3000` (or the port specified in `.env`).

2. Start the frontend development server:
   ```
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:5173` (default Vite port).

3. Open your browser and navigate to `http://localhost:5173` to access the application.

## Live URLs

- **Frontend**: https://talentloom.vercel.app/
- **Backend**: https://talentloom.onrender.com/

## Environment Variables

For the backend, create a .env file in the backend directory with the following variables (refer to .env.example if available):
