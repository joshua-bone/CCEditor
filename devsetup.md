# Dev Setup (CCEditor)

This document describes how to set up a local development environment for the DATEditor frontend.

## 1. Prerequisites

- **Git**
- **Node.js** (LTS, e.g. 20.x)
- **npm** (comes with Node)
- Recommended: **VSCode** with the following extensions:
  - `esbenp.prettier-vscode` (Prettier – Code formatter)
  - `dbaeumer.vscode-eslint` (ESLint)
  - GitLens (optional)

We recommend installing Node via **nvm**:

```bash
# Install nvm (if not installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

# Load nvm (new shell) and install Node LTS
```bash
nvm install --lts
nvm use --lts
nvm alias default 'lts/*'
```

# 2. Clone the Repository
```bash
git clone git@github.com:joshua-bone/CCEditor.git
cd CCEditor
```
(This is for SSH; HTTPS is also fine if SSH isn’t configured.)

# 3. Install Frontend Dependencies
All Node tooling currently lives in the frontend/ directory:
```bash
cd frontend
npm install
```

# 4. Running the Dev Server
```bash
cd frontend
npm run dev
```
Open the URL shown in the terminal (usually http://localhost:5173/).

# 5. Building and Previewing
```bash
cd frontend
npm run build     # Type-check + production build
npm run preview   # Serves the built app locally
```

# 6. Code Formatting
This repo uses Prettier as the source of truth for formatting.
Config: .prettierrc at the repo root.

To format the frontend code:
```bash
cd frontend
npm run format
```

# 7. Testing (Future)
Testing commands will be added in later tasks (TS27/TS28). Once present, they will be documented here.


# 8. Troubleshooting
If `npm run dev` fails:
- Check `node -v` and ensure you’re using an LTS version via `nvm use --lts`.
- If Prettier isn’t running on save:
- Check that the "Prettier - Code formatter" extension is installed.
- Ensure VSCode is using the workspace settings (.vscode/settings.json).