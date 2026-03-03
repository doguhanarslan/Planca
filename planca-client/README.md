# Planca Client

React frontend for the Planca appointment management platform.

## Setup

```bash
cp .env.example .env.development
npm install
npm run dev
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |

## Tech Stack

- **React 19** with TypeScript
- **Redux Toolkit** with RTK Query for state management and data fetching
- **TailwindCSS 4** for styling
- **React Big Calendar** for appointment calendar view
- **Formik + Yup** for forms and validation
- **Vite** as build tool
