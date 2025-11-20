#!/bin/bash

# WSEI Communicator - Quick Start Script
# This script starts both the backend and frontend development servers

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 WSEI Communicator - Starting development servers...${NC}\n"

# Check if MongoDB is running
echo -e "${YELLOW}Checking MongoDB connection...${NC}"
if ! nc -z localhost 27017 2>/dev/null; then
    echo -e "${YELLOW}⚠️  MongoDB is not running on localhost:27017${NC}"
    echo -e "${YELLOW}Please start MongoDB before continuing.${NC}"
    echo -e "  For Docker: ${GREEN}docker run -d -p 27017:27017 mongo${NC}"
    echo -e "  Or: ${GREEN}brew services start mongodb-community${NC}"
    exit 1
fi
echo -e "${GREEN}✓ MongoDB is running${NC}\n"

# Start backend
echo -e "${BLUE}📦 Starting backend server...${NC}"
cd wsei-communicator-server

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env from .env.example...${NC}"
    cp .env.example .env
fi

npm start &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
sleep 3

# Start frontend
echo -e "${BLUE}📦 Starting frontend development server...${NC}"
cd ../wsei-communicator-client

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env from .env.example...${NC}"
    cp .env.example .env
fi

npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}\n"

# Print server URLs
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Development servers are running!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "Backend:  ${BLUE}http://localhost:3000${NC}"
echo -e "Frontend: ${BLUE}http://localhost:5173${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}To stop the servers, press Ctrl+C${NC}\n"

# Handle Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

# Wait for both processes
wait
