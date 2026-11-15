# CollabMate (Edit-Where)

CollabMate—also referred to across the codebase as **Edit-Where**—is a cloud workspace dashboard and CLI sync tool for developers who want to push local project directories to the cloud, edit files from any browser, and pull changes back down without dragging around full archives every time.

Instead of acting as a full Git replacement, it focuses on fast, lightweight file synchronization using SHA-256 hash diffing backed by PostgreSQL and Google Drive.

---

## How It Works (Under the Hood)

CollabMate splits metadata and file storage cleanly between two layers:

- **Metadata & Diff Index (PostgreSQL + Prisma):** Tracks users, API keys, workspaces (`RootDirectory`), relative file paths, and each file's `fileHash` (SHA-256).
- **Blob Storage (Google Drive API v3):** Stores the actual file contents inside a configured Google Drive folder (`DRIVE_FOLDER_ID`) and maps each record via `driveFileId`.

### Sync & Editing Flow

1. **Push (`POST /api/v1/cli/edit-project`)**
   The CLI client zips your project directory (excluding ignored paths) and sends it up with your `workspaceId` and Bearer API key. The backend unpacks the archive, hashes each file with SHA-256, and compares it against the database:
   - **New files** are uploaded to Google Drive and inserted into PostgreSQL.
   - **Modified files** (hash mismatch) overwrite the existing file in Google Drive and update `fileHash`.
   - **Deleted files** (present in DB, missing from the zip) are removed from both Google Drive and PostgreSQL.

2. **Pull (`POST /api/v1/cli/pull/:workspaceId`)**
   Rather than downloading an entire workspace blindly, the CLI sends a `localFiles` map of `{ filePath: sha256Hash }`. The server checks what is out of date or missing on your machine, downloads only those files from Google Drive, and streams back `project_payload.zip` along with an `instructions.json` manifest listing local files that should be deleted (`{ "delete": [...] }`).

3. **Web Dashboard & In-Browser Editing**
   Users sign in via passwordless 6-digit email OTPs (dispatched with Mailjet and valid for 5 minutes), receiving an HTTP-only `jwttoken` cookie. From the dashboard you can create or delete workspaces, browse files, create empty files, edit code directly in the browser (which recalculates the SHA-256 hash and updates Google Drive on save), and generate or revoke 64-character hex API keys for the CLI.

---

## Repository Structure

```text
CollabMate-MonoRepo/
├── Edit-Where-backend/
│   ├── prisma/
│   │   └── schema.prisma         # User, ApiKey, RootDirectory, and File models
│   └── src/
│       ├── config/
│       │   └── drive.js          # Google OAuth2 client & Drive v3 instance
│       ├── controllers/
│       │   ├── cliController.js  # Zip extract, SHA-256 diffing, push & pull handlers
│       │   ├── login.js          # Email OTP auth, JWT cookies, and API key management
│       │   └── user.js           # Workspace CRUD and web file reading/editing
│       ├── middleware/
│       │   ├── clientAuth.js     # Bearer API key verification for CLI routes
│       │   └── webAuth.js        # HTTP-only JWT cookie verification for web routes
│       ├── routes/
│       │   ├── cliRoutes.js      # /api/v1/cli/*
│       │   ├── loginRoutes.js    # /api/v1/auth/*
│       │   └── webRoutes.js      # /api/v1/web/*
│       ├── services/
│       │   ├── driveHelper.js    # Drive upload, update, delete, and stream download
│       │   └── loginServices.js  # Email validation and Mailjet OTP dispatch
│       ├── db.js                 # Prisma client instance
│       └── server.js             # Express app entry point & CORS config
└── Edit-Where-frontend/
    └── src/
        ├── components/
        │   ├── layout/           # DashboardLayout, Sidebar, TopNavbar
        │   ├── ui/               # Reusable UI primitives (Button, Card, Dialog, etc.)
        │   └── views/            # WorkspaceOverview, WorkspaceDetail, FileEditView, ApiKeysView, DownloadPage
        ├── hooks/                # Data & auth hooks (useLoginHook, useWorkspaces, useWorkspaceDetail, useApiKeys, useTheme)
        ├── lib/
        │   └── apiClient.ts      # Fetch wrapper with credentials: 'include'
        ├── pages/                # LandingPage and LoginPage
        ├── types/                # Shared TypeScript interfaces
        └── App.tsx               # Client-side routing and session guard
```

---

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite 6, Tailwind CSS, React Router v7, Lucide Icons
- **Backend:** Node.js (ES Modules), Express 5, Prisma ORM, PostgreSQL
- **Integrations & Utilities:** Google Drive API (`googleapis`), Mailjet (`node-mailjet`), Multer, `adm-zip`, JSON Web Tokens (`jsonwebtoken`), `cookie-parser`

---

## Getting Started (Local Setup)

### Prerequisites

Before running the services locally, make sure you have:

- **Node.js** (v18+ recommended)
- **PostgreSQL** running locally or hosted (e.g., Neon, Supabase, or local Postgres)
- **Google Cloud OAuth2 credentials** with the Google Drive API enabled, a refresh token, and a target Drive folder ID
- **Mailjet account** (public and private API keys) for sending login OTP emails

> **Note:** `Edit-Where-backend` reads `nodemon` in its `dev` script (`nodemon src/server.js`). If `nodemon` is not installed globally on your machine, either install it globally (`npm i -g nodemon`) or run `npm start` instead.

### 1. Backend Setup (`Edit-Where-backend`)

Install dependencies:

```bash
cd Edit-Where-backend
npm install
```

Create a `.env` file in `Edit-Where-backend/`:

```env
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

DATABASE_URL="postgresql://user:password@localhost:5432/collabmate?schema=public"

JWT_SECRET="replace-with-a-strong-secret"
JWT_EXPIRES_IN="3h"

GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
GOOGLE_REFRESH_TOKEN="your-google-oauth-refresh-token"
DRIVE_FOLDER_ID="your-google-drive-folder-id"

MJ_APIKEY_PUBLIC="your-mailjet-public-key"
MJ_APIKEY_PRIVATE="your-mailjet-private-key"
```

Generate the Prisma client, push the schema to PostgreSQL, and start the server:

```bash
npm run build
npx prisma db push
npm run dev
```

You can verify Google Drive connectivity by hitting `GET http://localhost:8000/api/test-drive`.

### 2. Frontend Setup (`Edit-Where-frontend`)

Install dependencies:

```bash
cd Edit-Where-frontend
npm install
```

Create a `.env` file in `Edit-Where-frontend/`:

```env
VITE_BACKEND_URL=http://localhost:8000/api/v1
VITE_WINDOWS_CLIENT_DOWNLOAD=https://example.com/path/to/ew_client_windows.zip
VITE_LINUX_CLIENT_DOWNLOAD=https://example.com/path/to/ew_client_linux
```

Start the Vite dev server:

```bash
npm run dev
```

By default, Vite serves the app at `http://localhost:5173` (matching `FRONTEND_URL` in the backend `.env`).

---

## Using the CLI Client

Once both services are running:

1. Open the web dashboard, log in with your email and OTP, and create a new **Workspace**. Note its **Workspace ID**.
2. Go to the **API Keys** view and generate a new key.
3. Download the CLI executable for your OS from the `/download` page and place it in the root of the project you want to sync.
4. Create an `ew.config` file in that project root:

```ini
SERVER_URL=http://localhost:8000
WORKSPACE_ID=9
API_KEY=your-64-character-hex-api-key
IGNORE=[ew.config,ew_client_windows.exe,.env,node_modules]
```

5. Push local files up or pull cloud edits back down:

```bash
# Upload local changes to the workspace
./ew_client_windows.exe push

# Download remote changes (and remove deleted files) locally
./ew_client_windows.exe pull
```

---

## API Overview

All API routes are mounted under `/api/v1` (plus a utility check at `GET /api/test-drive`).

| Route Group | Auth | Endpoints | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/v1/auth` | Public / JWT Cookie | `POST /login`, `POST /validate-otp`, `POST /logout`, `GET /me`, `GET /keys`, `POST /keys`, `DELETE /keys/:id` | Email OTP authentication, session checks, and CLI API key management |
| `/api/v1/web` | HTTP-only JWT Cookie | `GET /workspaces`, `POST /workspaces`, `DELETE /workspaces`, `GET /workspaces/:workspaceId`, `POST /workspaces/:workspaceId/files`, `GET /files/:fileId`, `PUT /files/:fileId` | Workspace CRUD, file tree inspection, and reading/saving file contents via Drive |
| `/api/v1/cli` | `Authorization: Bearer <API_KEY>` | `POST /edit-project`, `POST /pull/:workspaceId` | Differential zip upload (`push`) and hash-based delta download (`pull`) |
