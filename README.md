# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/b3fccc28-6c7f-4e4a-80ce-eb73b28ebe78

## Harmony Genie NFT with Eliza AI Agent

This project integrates the Eliza AI agent from the mx-agent-kit to generate music based on user descriptions. Users can interact with the AI agent through a chat interface, and the agent will generate music that can be minted as NFTs.

### Quick Start with Eliza AI Agent

To start both the Eliza AI agent and the Harmony Genie NFT application, run:

```sh
./start-harmony-genie.sh
```

This will start:
- The Eliza AI agent on port 3000 (http://localhost:3000)
- The Eliza dashboard on port 5173 (http://localhost:5173)
- The Harmony Genie NFT application on port 5174 (http://localhost:5174)

For detailed instructions on setting up and using the Eliza AI agent integration, see [ELIZA_INTEGRATION.md](./ELIZA_INTEGRATION.md).

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/b3fccc28-6c7f-4e4a-80ce-eb73b28ebe78) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Eliza AI Agent (for music generation)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/b3fccc28-6c7f-4e4a-80ce-eb73b28ebe78) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
