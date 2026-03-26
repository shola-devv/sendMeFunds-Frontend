# SendMeFunds — Frontend

Frontend for the SendMeFunds fintech wallet system. Built with Next.js and TypeScript, consuming the SendMeFunds REST API for wallet creation, transfers, and account management.

## Features

- User registration and login
- Wallet dashboard — view balance and transaction history
- Peer-to-peer transfers with PIN confirmation
- Ledger view — full transaction history with debit/credit breakdown
- Role-aware UI — admin features visible to admin and super-admin accounts
- Cookie-based auth — no tokens stored in localStorage

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Auth:** next-auth
- **HTTP:** Axios

## Getting Started

### Installation
```bash
git clone https://github.com/yourusername/sendmefunds-frontend.git
cd sendmefunds-frontend
npm install
```

### Environment Variables

Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### Run
```bash
# development
npm run dev

# production build
npm run build
npm start
```

## Backend

This frontend connects to the SendMeFunds backend API.
→ [sendmefunds-backend](https://github.com/shola-devv/SendMeFunds-Fintech-model-.git)

## Deployment

Deployed on Vercel. Connect the repo and set the environment variables in the Vercel dashboard.

## Live Demo

[sholaemmanuel.dev](https://sholaemmanuel.dev)

## Author

**Shola Emmanuel**
[sholaemmanuel.dev](https://sholaemmanuel.dev)
