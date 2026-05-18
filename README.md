# Team Task Manager

A full-stack web application for team project and task management with role-based access control.

## Features

### Authentication
- User registration with email and password
- Secure login with JWT tokens
- Role-based access (Admin/Member)

### Project Management
- Create, edit, and delete projects
- Add team members to projects
- Assign roles (Admin/Member) within projects
- View project details and member list

### Task Management
- Create tasks within projects
- Assign tasks to team members
- Set task priority (Low/Medium/High)
- Set due dates for tasks
- Track task status (Pending/In Progress/Completed/Overdue)
- Automatic overdue detection

### Dashboard
- Overview of all projects
- Task statistics (Total, Pending, In Progress, Completed, Overdue)
- Quick access to project details
- Visual task status indicators

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React 18** - UI library
- **React Router** - Navigation
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons

## Project Structure

```
assesment project/
├── backend/
│   ├── config/
│   │   └── database.js          # SQLite database configuration
│   ├── middleware/
│   │   ├── auth.js              # Authentication middleware
│   │   └── projectAuth.js       # Project access control
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── projects.js          # Project management routes
│   │   ├── tasks.js             # Task management routes
│   │   └── users.js             # User routes
│   ├── .env                     # Environment variables
│   ├── package.json             # Backend dependencies
│   └── server.js                # Express server
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ui/              # Reusable UI components
│   │   ├── lib/
│   │   │   ├── api.js           # API client
│   │   │   └── utils.js         # Utility functions
│   │   ├── pages/
│   │   │   ├── Login.jsx        # Login page
│   │   │   ├── Signup.jsx       # Signup page
│   │   │   ├── Dashboard.jsx    # Dashboard page
│   │   │   ├── ProjectDetail.jsx # Project details page
│   │   │   └── CreateProject.jsx # Create project page
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles
│   ├── index.html
│   ├── package.json             # Frontend dependencies
│   ├── vite.config.js           # Vite configuration
│   ├── tailwind.config.js       # TailwindCSS configuration
│   └── postcss.config.js        # PostCSS configuration
└── README.md
```

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. The `.env` file is already configured with default settings. You can modify it if needed:
```
PORT=5000
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
```

4. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user

### Projects
- `GET /api/projects` - Get all projects for current user
- `GET /api/projects/:id` - Get single project with members
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/members` - Add member to project
- `DELETE /api/projects/:id/members/:userId` - Remove member from project

### Tasks
- `GET /api/tasks/project/:projectId` - Get all tasks for a project
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/stats/project/:projectId` - Get task statistics for project

### Users
- `GET /api/users` - Get all users
- `GET /api/users/profile` - Get current user profile

## Database Schema

### Users
- `id` - Primary key
- `email` - Unique email address
- `password` - Hashed password
- `name` - User's full name
- `role` - User role (admin/member)
- `created_at` - Timestamp

### Projects
- `id` - Primary key
- `name` - Project name
- `description` - Project description
- `owner_id` - Foreign key to users
- `created_at` - Timestamp

### Project Members
- `id` - Primary key
- `project_id` - Foreign key to projects
- `user_id` - Foreign key to users
- `role` - Member role in project (admin/member)
- `joined_at` - Timestamp

### Tasks
- `id` - Primary key
- `title` - Task title
- `description` - Task description
- `project_id` - Foreign key to projects
- `assigned_to` - Foreign key to users (nullable)
- `created_by` - Foreign key to users
- `status` - Task status (pending/in_progress/completed/overdue)
- `priority` - Task priority (low/medium/high)
- `due_date` - Due date (nullable)
- `created_at` - Timestamp
- `updated_at` - Timestamp

## Role-Based Access Control

### System Roles
- **Admin** - Full system access, can create projects and manage users
- **Member** - Can join projects and manage tasks within assigned projects

### Project Roles
- **Project Admin** - Can edit project details, add/remove members, delete project
- **Project Member** - Can view project, create and manage tasks

## Usage

1. **Sign Up**: Create a new account with email and password
2. **Login**: Sign in with your credentials
3. **Create Project**: Click "New Project" on the dashboard
4. **Add Members**: Navigate to a project and add team members by email
5. **Create Tasks**: Add tasks to projects, assign to members, set priority and due dates
6. **Track Progress**: Update task status, view statistics on dashboard

## Features in Detail

### Task Status Flow
- **Pending**: Default status for new tasks
- **In Progress**: Task is being worked on
- **Completed**: Task is finished
- **Overdue**: Automatically set when due date passes and task is not completed

### Priority Levels
- **Low**: Low priority tasks
- **Medium**: Default priority
- **High**: High priority urgent tasks

## Development

### Running Both Servers

Open two terminal windows:

Terminal 1 (Backend):
```bash
cd backend
npm start
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### Building for Production

Frontend:
```bash
cd frontend
npm run build
```

The built files will be in the `frontend/dist` directory.

## Security Notes

- JWT tokens are stored in localStorage (consider using httpOnly cookies for production)
- Passwords are hashed using bcryptjs
- Input validation is implemented on the backend
- Change the JWT_SECRET in production environment

## Future Enhancements

- Email notifications for task assignments
- File attachments for tasks
- Comments and discussion threads
- Real-time updates with WebSocket
- Advanced filtering and search
- Export project reports
- Dark mode toggle
- Mobile app version
