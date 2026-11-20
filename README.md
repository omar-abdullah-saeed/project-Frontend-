# Interview Questions Maker

Interview Questions Maker helps users prepare for interviews by generating
practice questions for a chosen job role and subject area.

## How to use the app

1. Create an account or sign in.
2. Open **API key procedure** to learn how to create a Gemini API key.
3. Go to **Create interview question**, enter the API key, and select **Continue**.
   The key is sent to the backend for AI requests and is not saved by the app.
4. Enter the job role and select **Find my subjects**.
5. Choose the subjects to practice, or select all of them.
6. Choose **2**, **5**, or **10 questions** to start the interview practice.

## Run locally

Requirements: Node.js and access to MongoDB.

From the project root, install the dependencies and create the local environment
file:

```powershell
npm --prefix backend install
npm --prefix frontend install
if (-not (Test-Path backend\.env)) { Copy-Item backend\.env.sample backend\.env }
```

Edit `backend\.env` with your MongoDB connection string, a long random JWT
secret, and any server-side Gemini API key you want to configure. Never commit
this file.

Start the app:

```powershell
npm --prefix backend start
```

The backend builds and serves the frontend at `http://localhost:8080`.

For frontend development with Vite, run the backend and frontend development
servers in separate terminals:

```powershell
npm --prefix backend run dev
npm --prefix frontend run dev
```

## Push to GitHub

1. Create an empty repository on GitHub.
2. From the project root, initialize Git if needed and check that local
   credentials are ignored:

   ```powershell
   git init
   git check-ignore -v backend/.env
   git add .
   git status --short
   ```

   Confirm `backend\.env` is not listed as a staged file. The `.env.sample`
   file contains placeholders and can be committed.

3. Commit the project, add your GitHub repository as the remote, and push:

   ```powershell
   git commit -m "Initial project upload"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git push -u origin main
   ```

If a real API key was ever committed or pushed, revoke it and create a
replacement. Adding it to `.gitignore` does not remove it from Git history.

## More information

See [backend/README.md](./backend/README.md) for the API setup and endpoint
documentation.
