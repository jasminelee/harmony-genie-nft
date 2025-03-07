# Eliza AI Agent Integration for Harmony Genie NFT

This document provides instructions on how to set up and use the Eliza AI agent integration for the Harmony Genie NFT application.

## Overview

The Harmony Genie NFT application uses the Eliza AI agent from the mx-agent-kit to generate music based on user descriptions. Users can interact with the AI agent through a chat interface, and the agent will generate music that can be minted as NFTs.

## Prerequisites

- Node.js 16 or higher
- npm or yarn
- Eliza AI agent from mx-agent-kit

## Setup Instructions

### 1. Start the Eliza AI Agent

First, you need to start the Eliza AI agent from the mx-agent-kit directory:

```bash
cd mx-agent-kit/eliza
npm install
npm run dev
```

This will start the Eliza AI agent on port 3000 by default, and the Eliza dashboard will be available at http://localhost:5173.

### 2. Configure the Harmony Genie NFT Application

Make sure the `.env` file in the root of the harmony-genie-nft application has the following variables:

```
VITE_ELIZA_PORT=3000
VITE_ELIZA_AGENT_ID=music-generation-agent
```

Adjust the port if your Eliza agent is running on a different port.

### 3. Start the Harmony Genie NFT Application

Start the Harmony Genie NFT application:

```bash
npm install
npm run dev
```

This will start the application on port 5174 by default. You can access it at http://localhost:5174.

## Using the AI Agent

1. Open the Harmony Genie NFT application in your browser at http://localhost:5174.
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
3. Verify that the agent ID in the `.env` file matches the ID in the agent configuration file.
4. If the agent is not responding, try restarting both the agent and the application.
5. Make sure you're accessing the Harmony Genie NFT application at http://localhost:5174, not http://localhost:5173 (which is the Eliza dashboard).

## Customizing the Agent

You can customize the music generation agent by modifying the configuration file at:

```
mx-agent-kit/eliza/agent/data/music-generation-agent.json
```

This file defines the agent's personality, instructions, and available tools.

## Additional Resources

- [Eliza AI Agent Documentation](https://github.com/microsoft/eliza)
- [Harmony Genie NFT Documentation](https://github.com/your-org/harmony-genie-nft) 