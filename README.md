# Next.js 16 Todo Application

A modern, full-stack todo application built with Next.js 16, Drizzle ORM, and PostgreSQL. Features a clean, responsive design with dark/light mode support and efficient state management.

## 🚀 Features

- ✅ **CRUD Operations**: Create, read, update, and delete todos
- 🎨 **Modern UI**: Clean, responsive design with Tailwind CSS
- 🌓 **Dark/Light Mode**: Toggle between themes with system preference detection
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 🔄 **Real-time Updates**: Optimistic UI updates with SWR for data fetching
- 🗄️ **PostgreSQL Database**: Robust data persistence with Drizzle ORM
- 🏗️ **Server Actions**: Next.js 16 server actions for seamless server-client communication
- 🎯 **Filter System**: View all, active, or completed todos
- ✏️ **Inline Editing**: Edit todos directly in the list
- 🕒 **Timestamps**: Track creation and update times

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: JavaScript
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS
- **State Management**: SWR + React State
- **UI Components**: Custom components with class-variance-authority
- **Icons**: Lucide React

## 📁 Project Structure

```
nextjs-app/
├── src/
│   ├── app/                    # Next.js 16 App Router
│   │   ├── api/todos/         # API routes
│   │   ├── globals.css        # Global styles
│   │   ├── layout.jsx         # Root layout
│   │   └── page.jsx           # Home page
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── TodoApp.jsx       # Main todo application
│   │   ├── TodoForm.jsx      # Add todo form
│   │   ├── TodoItem.jsx      # Individual todo item
│   │   ├── TodoList.jsx      # Todo list with filters
│   │   ├── ThemeProvider.jsx # Theme context provider
│   │   └── ThemeToggle.jsx   # Dark/light mode toggle
│   ├── hooks/                # Custom React hooks
│   │   └── useTodos.js       # SWR hook for todos
│   └── lib/                  # Utilities and configurations
│       ├── actions.js        # Server actions
│       ├── db.js            # Database connection
│       └── utils.js         # Utility functions
├── db/                       # Database files
│   ├── schema.js            # Drizzle schema
│   ├── drizzle.config.js    # Drizzle configuration
│   └── migrations/          # Database migrations
├── package.json
├── .env.local
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or remote)
- npm, yarn, or pnpm package manager

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd nextjs-app
npm install
```

### 2. Database Setup

#### Option A: Local PostgreSQL

1. Install PostgreSQL on your system
2. Create a new database:

```sql
CREATE DATABASE todoapp;
```

#### Option B: Remote PostgreSQL (Recommended)

Use a cloud PostgreSQL service like:

- **Supabase** (Free tier available)
- **Neon** (Free tier available)
- **Railway** (Free tier available)
- **Vercel Postgres**

### 3. Environment Configuration

Update `.env.local` with your database connection string:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/todoapp"
# Or for cloud services:
# DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database Migration

Generate and run database migrations:

```bash
# Generate migration files
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Alternative: Push schema directly (for development)
npm run db:push
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:migrate` - Apply migrations
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## 🗄️ Database Schema

The application uses a single `todos` table:

```sql
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL
);
```

## 🎨 UI Components

### Reusable Components

- **Button**: Styled button with variants (default, destructive, outline, ghost)
- **Input**: Form input with consistent styling
- **Card**: Container component for content sections

### Todo-Specific Components

- **TodoApp**: Main application wrapper with theme and data management
- **TodoForm**: Form for adding new todos
- **TodoList**: List container with filtering capabilities
- **TodoItem**: Individual todo with edit/delete/toggle functionality
- **ThemeToggle**: Dark/light mode switcher

## 🔄 State Management

The app uses a hybrid approach:

1. **SWR** for server state (todos data)
2. **React useState** for component-level state (forms, editing modes)
3. **Server Actions** for mutations with automatic revalidation

## 🌓 Theme System

- Automatic system theme detection
- Manual toggle between light/dark modes
- Persistent theme preference in localStorage
- CSS custom properties for consistent theming

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub/GitLab/Bitbucket
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The app can be deployed on:

- Railway
- Render
- DigitalOcean App Platform
- AWS Amplify
- Netlify (with serverless functions)

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify DATABASE_URL is correct
   - Ensure PostgreSQL is running
   - Check network connectivity

2. **Migration Errors**
   - Run `npm run db:push` for development
   - Check database permissions

3. **Build Errors**
   - Clear `.next` folder and rebuild
   - Verify all dependencies are installed

### Development Tips

- Use `npm run db:studio` to inspect database
- Check browser console for client-side errors
- Monitor server logs for API issues

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [SWR Documentation](https://swr.vercel.app/)
