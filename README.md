# IdeaJI - Idea Sharing Platform

IdeaJI is a modern web application built with Next.js that allows users to share, discuss, and collaborate on ideas. The platform provides a space for innovators, entrepreneurs, and creative minds to connect and exchange thoughts.

## Features

- User authentication and email verification
- Idea sharing and management
- Real-time feedback and discussions
- User profiles and activity tracking
- Points and rewards system
- AI-powered idea analysis
- Chat functionality for idea discussions

## Tech Stack

- Next.js 15
- TypeScript
- Prisma (SQLite)
- NextAuth.js
- Tailwind CSS
- OpenAI API

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/Abhinav-2002/IdeaJI.git
cd IdeaJI
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email Configuration
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

4. Initialize the database:
```bash
npx prisma migrate dev
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
