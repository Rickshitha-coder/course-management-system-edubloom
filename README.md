# 🌱 EduBloom – Student Course Management System

<p align="center">
  <img src="https://img.shields.io/badge/Project-EduBloom-2E8B57?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Full%20Stack-Web%20Application-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" />
</p>

<h3 align="center">Learn • Grow • Achieve</h3>

<p align="center">
  A centralized platform designed to simplify course management, student enrollment, learning activities, and academic progress tracking.
</p>

<p align="center">
  <a href="https://course-management-system-edubloom.vercel.app/">
    🚀 Live Demo
  </a>
  |
  <a href="https://github.com/Rickshitha-coder/course-management-system-edubloom">
    💻 GitHub Repository
  </a>
</p>

---

## 📌 1. Project Overview

**EduBloom** is a full-stack Student Course Management and Learning Progress Tracking System developed to simplify academic course administration and improve the student learning experience.

The application provides a centralized platform where students can register, explore available courses, enroll in courses, access learning materials, and monitor their learning progress.

It also provides administrators with tools to manage student information, maintain course details, monitor enrollments, and analyze academic activities.

The main goal is to create an organized, accessible, and user-friendly digital learning environment.

## 🎯 2. Problem Statement

Traditional course management processes often involve manual registration, scattered learning resources, and difficulty tracking student progress.

EduBloom addresses these challenges by providing:

- Centralized course information.
- Simplified student registration and authentication.
- Easy course browsing and enrollment.
- Organized learning materials.
- Individual learning progress tracking.
- Administrative management tools.
- Student communication and notifications.

## ✨ 3. Key Features

### 👩‍🎓 Student Features

- Student registration and secure login.
- Personalized student dashboard.
- Browse and search available courses.
- Enroll and unenroll from courses.
- Access course information and learning materials.
- Track course completion percentage.
- Monitor completed and pending modules.
- Manage personal profile.
- View notifications.
- Communicate through the messaging system.

### 👨‍💻 Administrator Features

- Secure administrator authentication.
- Manage student records.
- Add, update, and delete courses.
- Monitor student enrollments.
- View student information.
- Reset student passwords.
- Export student records as CSV.
- Monitor course activities.
- Access administrative dashboards.

### 📊 Learning Progress Management

- Track completed learning modules.
- Display course completion percentages.
- Monitor ongoing and completed courses.
- Maintain learning progress information.

### 💬 Communication System

- Real-time messaging using Socket.IO.
- Notification management.
- Message history.
- Enrollment and course-related updates.

## 🛠️ 4. Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | HTML5, CSS3, Bootstrap, JavaScript |
| React Frontend | React.js, Vite, React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JWT |
| Password Security | bcrypt / bcryptjs |
| API Communication | REST APIs, Axios |
| Real-Time Communication | Socket.IO |
| API Testing | Postman |
| Version Control | Git, GitHub |
| Frontend Deployment | Vercel |
| Backend Deployment | Render |

## 🏗️ 5. System Architecture

EduBloom follows a client-server architecture.

**Application Workflow:**

1. The user opens the EduBloom application.
2. The user registers or logs in.
3. Authentication is handled through the backend.
4. The backend validates the request and processes application logic.
5. MongoDB stores and retrieves application data.
6. The frontend displays the requested information.
7. Students can manage their courses and learning progress.
8. Administrators can manage students, courses, and enrollments.

**Architecture Flow:**

```text
             USER
               |
               ▼
       REACT FRONTEND
               |
               ▼
        REST API REQUEST
               |
               ▼
       NODE.JS + EXPRESS
               |
          ┌────┴────┐
          ▼         ▼
       MONGODB   SOCKET.IO
          |         |
          ▼         ▼
       DATABASE  MESSAGING
          |
          ▼
       API RESPONSE
          |
          ▼
       FRONTEND UI
```

## 📂 6. Project Structure

```text
course-management-system-edubloom/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── validators/
│   ├── services/
│   ├── scripts/
│   └── server.js
│
├── react-frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── assets/
│   ├── public/
│   └── package.json
│
├── frontend/
│   └── Original HTML/CSS/JS frontend
│
├── mock-api/
│   └── Mock API data
│
├── docs/
│   ├── database-schema.md
│   └── postman/
│
├── Project-structure.docx
├── README.md
└── .gitignore
```

## 🔐 7. Authentication and Security

EduBloom implements authentication and security measures to protect user information.

- JWT-based authentication.
- Password hashing using bcrypt.
- Role-based access control for administrators and students.
- Input validation.
- Centralized error handling.
- Security headers using Helmet.
- API rate limiting.
- CORS configuration.
- Protected API routes.

## 🗄️ 8. Database Design

The application uses MongoDB to manage its data.

Major data entities include:

| Collection | Purpose |
|---|---|
| Students | Student account and profile information |
| Admins | Administrator account information |
| Courses | Course details and descriptions |
| Enrollments | Student course enrollment records |
| Progress | Learning completion information |
| Messages | User communication history |
| Notifications | Student notifications |

## 🔌 9. API Overview

The backend exposes RESTful APIs under:

`/api/v1`

| Module | Operations |
|---|---|
| Authentication | Register, Login, Forgot Password, Reset Password |
| Students | Create, Read, Update, Delete |
| Courses | Browse, Add, Update, Delete |
| Enrollments | Enroll, Unenroll, View Enrollments |
| Profile | View and Update Profile |
| Progress | View and Update Learning Progress |
| Messages | Contacts and Message History |
| Notifications | View and Mark as Read |

Health Check:

`GET /api/health`

## ⚙️ 10. Installation and Setup

Follow these steps to run EduBloom locally.

### Prerequisites

Install the following:

- Node.js
- npm
- MongoDB or MongoDB Atlas
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/Rickshitha-coder/course-management-system-edubloom.git

cd course-management-system-edubloom
```

### Step 2: Configure the Backend

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example` as a reference.

Configure the required environment variables:

```env
PORT=3001
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret
JWT_EXPIRES_IN=1h
CLIENT_URL=http://localhost:5173
```

Configure email-related variables if email functionality is required.

### Step 3: Initialize the Backend

Generate a secure JWT secret and configure it in your environment.

Run the database seed script:

```bash
npm run seed
```

Create an administrator account:

```bash
npm run create-admin
```

Start the backend:

```bash
npm start
```

Backend URL:

`http://localhost:3001`

### Step 4: Configure the Frontend

Open another terminal:

```bash
cd react-frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_SOCKET_URL=http://localhost:3001
```

Start the frontend:

```bash
npm run dev
```

Frontend URL:

`http://localhost:5173`

## 🧪 11. Testing

API testing can be performed using Postman.

Important test scenarios include:

- Student registration.
- User login and authentication.
- Invalid login attempts.
- Course creation and management.
- Student enrollment.
- Learning progress updates.
- Student profile management.
- Notifications.
- Real-time messaging.
- API authorization and validation.

The repository includes a Postman collection under `docs/postman/`.

## 🌐 12. Live Deployment

**Live Application:**

https://course-management-system-edubloom.vercel.app/

**GitHub Repository:**

https://github.com/Rickshitha-coder/course-management-system-edubloom

The React frontend is deployed using Vercel. The backend can be deployed using Render with MongoDB Atlas as the database.

## 🚀 13. Future Enhancements

Potential improvements include:

- Online assignment submission.
- Quiz and assessment management.
- Automated course completion certificates.
- Advanced learning analytics.
- Email and push notifications.
- Course recommendation system.
- Video-based learning integration.
- Enhanced mobile responsiveness.
- Improved security using HttpOnly cookie-based authentication.

## ⚠️ 14. Current Limitations

- Some legacy HTML/JavaScript pages still use browser localStorage for enrollment, progress, and certificate data.
- The corresponding backend APIs are available but those legacy pages have not yet been migrated to use them.
- JWT authentication currently uses sessionStorage.
- Real-time messaging requires additional recipient authorization and rate-limit improvements before a public production launch.

## 👩‍💻 15. Developer

**Rickshitha A.**

B.Sc. Computer Science with Artificial Intelligence

Interested in Full Stack Development, Frontend Development, and building practical web applications.

GitHub: https://github.com/Rickshitha-coder

Portfolio: https://rickshitha2006.github.io/Portfolio/

---

<p align="center">
  <b>🌱 EduBloom – Learn Today, Grow Tomorrow!</b>
</p>

<p align="center">
  Made with ❤️ by Rickshitha A.
</p>
