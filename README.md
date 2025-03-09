# Eliza AI Agent Integration for HarmonyX

This document provides instructions on how to set up and use the Eliza AI agent integration for the HarmonyX daoo.

## Overview

The HarmonyX application uses the Eliza AI agent from the mx-agent-kit to generate music based on user descriptions. Users can interact with the AI agent through a chat interface, and the agent will generate music that can be minted as NFTs on MultiversX.

## Prerequisites

- Node.js 23.3.0
- npm
- Eliza AI agent from mx-agent-kit

## Setup Instructions

## ⚙️ Local Setup  

### Step 0: Run the Setup Script  
Execute the setup script to install dependencies from the mx-agent-kit directory::  
```sh
cd mx-agent-kit
chmod +x setup.sh
./setup.sh
```


### 1. Start the Eliza AI Agent

First, you need to start the Eliza AI agent from the mx-agent-kit directory:

```bash
cd mx-agent-kit/eliza
npm install
pnpm run start
```

This will start the Eliza AI agent on port 3000 by default, and the Eliza dashboard will be available at http://localhost:5173.

Adjust the port if your Eliza agent is running on a different port.

### 2. Start AI Gateway

In another terminal, , start the **AI Gateway**:  
```sh
cd mx-agent-kit/gateway
npm run dev:node
```
This will start the application on port 5174 by default. You can access it at http://localhost:5174.

### 3. Start the HarmonyX Application

Start the HarmonyXapplication:

```bash
npm install
npm run dev
```

This will start the application on port 8080 by default.

## Using the Dapp

1. Open the HarmonyX application in your browser at http://localhost:8080.
2. Navigate to the chat interface.
3. Describe the kind of music you want to generate. For example:
   - "I want a relaxing ambient track with piano and soft synths."
   - "Generate an upbeat pop song with a catchy chorus."
   - "Create a lo-fi hip hop beat with jazzy samples."
4. The AI agent will respond and generate music based on your description.
5. Once the music is generated, you can mint it as an NFT.

## Troubleshooting

If you encounter issues with the integration, check the following:

1. Make sure the Eliza AI agent is running and accessible at the configured port (default: 3000).
2. Check the browser console for any error messages.
3. If the agent is not responding, try restarting both the agent and the application.

## Last Step

Profit!!