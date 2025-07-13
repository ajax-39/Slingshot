#!/bin/bash

echo "Starting Ajax NSE Stock Manager..."
echo

echo "[1/2] Starting backend server..."
cd server
npm run dev &
BACKEND_PID=$!
cd ..

echo "[2/2] Starting frontend development server..."
sleep 3
npm run dev &
FRONTEND_PID=$!

echo
echo "Both servers are starting up!"
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:3001"
echo
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
