
  # Glass Material Editor

  This is a code bundle for Glass Material Editor. The original project is available at https://www.figma.com/design/3DnZVlsFktKo6P2sR1E2dJ/Glass-Material-Editor.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the client (Vite on port 3000).

  To start backend API (Express + MongoDB):
  - Copy `.env.example` to `.env` and set `MONGO_URI`, `JWT_SECRET` if needed
  - Run `npm run server` (starts API on port 4000)

  Or run both concurrently:
  - `npm run dev:all`
  
  ## Guidelines

  Please read the project guidelines before contributing:

  - src/guidelines/Guidelines.md
  