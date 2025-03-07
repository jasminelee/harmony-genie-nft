#!/bin/bash

# Start Harmony Genie NFT with Eliza AI Agent
# This script starts both the Eliza AI agent and the Harmony Genie NFT application

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Harmony Genie NFT with Eliza AI Agent...${NC}"

# Check if the mx-agent-kit directory exists
if [ ! -d "mx-agent-kit" ]; then
  echo -e "${YELLOW}Error: mx-agent-kit directory not found.${NC}"
  echo "Please make sure you have the mx-agent-kit directory in the same directory as this script."
  exit 1
fi

# Start the Eliza AI agent in the background
echo -e "${GREEN}Starting Eliza AI agent...${NC}"
cd mx-agent-kit/eliza
npm install --silent
echo -e "${GREEN}Starting Eliza server...${NC}"
npm run dev &
ELIZA_PID=$!

# Wait for the Eliza server to start
echo -e "${YELLOW}Waiting for Eliza server to start...${NC}"
sleep 10

# Go back to the harmony-genie-nft directory
cd ../../

# Start the Harmony Genie NFT application
echo -e "${GREEN}Starting Harmony Genie NFT application...${NC}"
npm install --silent
npm run dev &
HARMONY_PID=$!

echo -e "${GREEN}Both applications are now running!${NC}"
echo -e "${YELLOW}Eliza AI agent is running on http://localhost:3000${NC}"
echo -e "${YELLOW}Eliza dashboard is running on http://localhost:5173${NC}"
echo -e "${YELLOW}Harmony Genie NFT is running on http://localhost:5174${NC}"
echo -e "${GREEN}Press Ctrl+C to stop both applications${NC}"

# Function to handle cleanup when the script is terminated
cleanup() {
  echo -e "${YELLOW}Stopping applications...${NC}"
  kill $ELIZA_PID
  kill $HARMONY_PID
  echo -e "${GREEN}Applications stopped.${NC}"
  exit 0
}

# Register the cleanup function to be called on exit
trap cleanup SIGINT SIGTERM

# Wait for user to press Ctrl+C
wait 