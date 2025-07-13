# Development Setup Guide

## Quick Start

To start both frontend and backend servers with a single command:

```bash
npm run dev
```

This will start:

- 🔧 **Backend Server** on http://localhost:3001
- ⚡ **Frontend Server** on http://localhost:5173

## Available Scripts

### Primary Development Commands

| Command               | Description                                            |
| --------------------- | ------------------------------------------------------ |
| `npm run dev`         | Start both frontend and backend servers simultaneously |
| `npm run install:all` | Install dependencies for both frontend and backend     |

### Individual Server Commands

| Command                | Description                                             |
| ---------------------- | ------------------------------------------------------- |
| `npm run dev:frontend` | Start only the frontend server (Vite)                   |
| `npm run server:dev`   | Start only the backend server (Node.js with watch mode) |
| `npm run server:start` | Start backend server in production mode                 |

### Build Commands

| Command           | Description                   |
| ----------------- | ----------------------------- |
| `npm run build`   | Build frontend for production |
| `npm run preview` | Preview production build      |
| `npm run lint`    | Run ESLint on the codebase    |

## Development Workflow

1. **Initial Setup**:

   ```bash
   npm run install:all
   ```

2. **Daily Development**:

   ```bash
   npm run dev
   ```

3. **Testing Backend Only**:

   ```bash
   npm run server:dev
   ```

4. **Testing Frontend Only**:
   ```bash
   npm run dev:frontend
   ```

## Server Status Indicators

When running `npm run dev`, you'll see colored output:

- 🔧 **SERVER** (Blue) - Backend server logs
- ⚡ **FRONTEND** (Cyan) - Frontend server logs

## Troubleshooting

### Port Conflicts

- Frontend default: 5173
- Backend default: 3001

If ports are in use, you can modify:

- Frontend: Vite will automatically try the next available port
- Backend: Change `PORT` in `server/.env`

### Backend Not Starting

1. Check if Node.js version is >= 18
2. Ensure all dependencies are installed: `npm run install:all`
3. Check server logs for specific error messages

### Frontend Not Connecting to Backend

1. Verify backend is running on port 3001
2. Check CORS settings in `server/.env`
3. Ensure `VITE_API_URL` in `.env` points to correct backend URL

## Environment Variables

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:3001/api
```

### Backend (server/.env)

```bash
NODE_ENV=development
DEBUG=true
FRONTEND_URL=http://localhost:5173
PORT=3001
```

## File Watching

Both servers support hot reload:

- **Frontend**: Vite automatically reloads on file changes
- **Backend**: Node.js `--watch` flag restarts server on file changes

## Production Deployment

1. Build the frontend:

   ```bash
   npm run build
   ```

2. Start backend in production mode:

   ```bash
   npm run server:start
   ```

3. Serve the built frontend using a static file server or integrate with your backend.
