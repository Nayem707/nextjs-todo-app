# Project Management System - Architecture Guide

## Overview

This Next.js application has been transformed from a simple todo app into an enterprise-level project management system with multi-user authentication, team collaboration, task assignment, and activity tracking.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js v5 with bcrypt password hashing
- **Type Safety**: TypeScript throughout

## Architecture Pattern

The application follows a **layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│         UI Layer (React Components)      │
├─────────────────────────────────────────┤
│    API Routes / Server Actions Layer     │
├─────────────────────────────────────────┤
│         Service Layer (Business Logic)   │
├─────────────────────────────────────────┤
│    Repository Layer (Data Access)        │
├─────────────────────────────────────────┤
│         Database (PostgreSQL)            │
└─────────────────────────────────────────┘
```

### Why This Architecture?

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Testability**: Layers can be tested independently
3. **Maintainability**: Changes in one layer don't cascade to others
4. **Scalability**: Easy to add new features or modify existing ones
5. **Type Safety**: DTOs ensure type-safe communication between layers

## Database Schema

### Tables

1. **users** - User accounts and authentication
   - UUID primary key
   - Name, email (unique), password (hashed)
   - Created/updated timestamps

2. **projects** - Project management
   - UUID primary key
   - Name, description, status (enum), progress (0-100)
   - Owner relationship to users
   - Created/updated timestamps

3. **tasks** - Individual tasks within projects
   - UUID primary key
   - Title, description, status (enum), priority (enum)
   - Progress percentage, due date, completion date
   - Foreign keys: projectId, assignedTo, createdBy
   - Created/updated timestamps

4. **projectMembers** - Team membership and roles
   - UUID primary key
   - Role enum (admin, member, viewer)
   - Foreign keys: projectId, userId
   - Join timestamp

5. **activities** - Audit trail and activity feed
   - UUID primary key
   - Type enum (project_created, task_updated, etc.)
   - Description, metadata (JSONB)
   - Foreign keys: projectId, taskId (optional), userId
   - Timestamp

6. **comments** - Task discussions
   - UUID primary key
   - Content, edited flag
   - Foreign keys: taskId, userId
   - Created/updated timestamps

### Relationships

- Projects have one owner (user)
- Projects have many members (many-to-many through projectMembers)
- Projects have many tasks
- Tasks belong to one project
- Tasks can be assigned to one user
- Tasks have many comments
- Activities track all changes across projects and tasks

## Layer Details

### 1. Repository Layer (`src/repositories/`)

**Purpose**: Encapsulate all database queries and data access logic

**Files**:

- `UserRepository.ts` - User CRUD operations
- `ProjectRepository.ts` - Project queries with joins and aggregations
- `TaskRepository.ts` - Task management with filtering
- `MemberRepository.ts` - Team membership operations
- `ActivityRepository.ts` - Activity logging

**Key Features**:

- Drizzle ORM query builders
- Complex joins for detailed views
- Pagination support
- Filter builders
- Type-safe returns using database schema types

**Example**:

```typescript
// Repository handles ONLY data access
async findByIdWithDetails(id: string) {
  const [result] = await db
    .select({...})
    .from(projects)
    .innerJoin(users, eq(projects.ownerId, users.id))
    .where(eq(projects.id, id));
  return result;
}
```

### 2. Service Layer (`src/services/`)

**Purpose**: Implement business logic, validation, and orchestrate repositories

**Files**:

- `ProjectService.ts` - Project business logic
- `TaskService.ts` - Task management logic
- `AuthService.ts` - User registration logic

**Key Responsibilities**:

- Input validation
- Access control checks
- Business rule enforcement
- Activity logging
- Transaction coordination
- Error handling with custom errors

**Example**:

```typescript
// Service handles business logic and validation
async createProject(data: CreateProjectDTO, userId: string) {
  // 1. Validate input
  if (!data.name?.trim()) {
    throw new ValidationError('Project name is required');
  }

  // 2. Create project (repository)
  const project = await this.projectRepo.create({...});

  // 3. Add creator as admin (repository)
  await this.memberRepo.addMember({...});

  // 4. Log activity (repository)
  await this.activityRepo.logProjectActivity({...});

  return project;
}
```

### 3. API Routes (`src/app/api/`)

**Purpose**: Expose RESTful endpoints with authentication and error handling

**Structure**:

- `/api/auth/register` - User registration
- `/api/auth/[...nextauth]` - NextAuth handlers
- `/api/projects` - List/create projects
- `/api/projects/[id]` - Get/update/delete project
- `/api/projects/[id]/tasks` - Project tasks
- `/api/tasks/[id]` - Task operations

**Features**:

- Session authentication check
- Request/response validation
- Consistent error handling
- Typed responses using `ApiResponse<T>`

**Example**:

```typescript
export async function GET(req: NextRequest) {
  // 1. Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // 2. Call service layer
  const result = await projectService.getUserProjects(session.user.id);

  // 3. Return typed response
  return NextResponse.json<ApiResponse<typeof result>>(
    { success: true, data: result },
    { status: 200 }
  );
}
```

### 4. Server Actions (`src/actions/`)

**Purpose**: Form handlers and mutations with automatic revalidation

**Files**:

- `authActions.ts` - Sign in, sign out, register
- `projectActions.ts` - Create, update, delete projects
- `taskActions.ts` - Task CRUD operations

**Features**:

- `'use server'` directive for server-side execution
- Automatic session handling
- Path revalidation for cache updates
- Consistent error responses

**Example**:

```typescript
'use server';

export async function createProjectAction(data: CreateProjectDTO) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const project = await projectService.createProject(data, session.user.id);
  revalidatePath('/projects'); // Refresh cache

  return { success: true, data: project };
}
```

### 5. Type System (`src/types/`)

**Purpose**: Centralized type definitions, DTOs, and error classes

**Key Types**:

**Enums**:

```typescript
export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}
```

**DTOs (Data Transfer Objects)**:

```typescript
export interface CreateProjectDTO {
  name: string;
  description?: string;
  status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
}
```

**Response Types**:

```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

**Error Classes**:

```typescript
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}
```

## Authentication Flow

### NextAuth.js Configuration

**File**: `src/lib/auth.ts`

**Provider**: Credentials with email/password
**Session Strategy**: JWT
**Session Duration**: 30 days

**Flow**:

1. User submits email/password
2. `authorize()` callback verifies credentials
3. Password compared using bcrypt
4. JWT token created with user info
5. Session object populated via callbacks

### Middleware Protection

**File**: `src/middleware.ts`

**Protected Routes**: All routes except `/auth/*`
**Behavior**:

- Unauthenticated users → Redirect to `/auth/signin`
- Authenticated users on auth pages → Redirect to `/projects`

## Security Features

1. **Password Hashing**: bcrypt with salt rounds (10)
2. **JWT Tokens**: Signed with secret key
3. **Session Validation**: Middleware checks on every request
4. **Role-Based Access**:
   - Owner can delete projects
   - Admins can add/remove members
   - Members can create tasks
   - Viewers can only read
5. **SQL Injection Prevention**: Drizzle ORM parameterized queries
6. **XSS Protection**: React's built-in escaping

## Data Flow Example: Creating a Task

```
1. User fills form → UI Component
   ↓
2. Form submission → Server Action (createTaskAction)
   ↓
3. Authentication check → NextAuth session
   ↓
4. Call service → TaskService.createTask()
   ↓
5. Validate input → Service layer checks
   ↓
6. Check project access → MemberRepository.isMember()
   ↓
7. Validate assignee → MemberRepository.isMember()
   ↓
8. Create task → TaskRepository.create()
   ↓
9. Log activity → ActivityRepository.logTaskActivity()
   ↓
10. Revalidate cache → revalidatePath()
   ↓
11. Return response → { success: true, data: task }
```

## File Structure

```
src/
├── actions/              # Server Actions
│   ├── authActions.ts
│   ├── projectActions.ts
│   └── taskActions.ts
├── app/                  # Next.js App Router
│   ├── api/             # API Routes
│   │   ├── auth/
│   │   ├── projects/
│   │   └── tasks/
│   ├── auth/            # Auth pages (signin, signup)
│   ├── projects/        # Project pages
│   ├── layout.jsx       # Root layout
│   └── page.jsx         # Home page
├── components/          # React Components
│   └── projects/
│       └── ProjectList.tsx
├── db/                  # Database
│   ├── index.ts        # Drizzle client
│   ├── schema.ts       # Schema definition
│   └── drizzle.config.js
├── lib/                # Utilities
│   └── auth.ts         # NextAuth config
├── repositories/       # Data Access Layer
│   ├── UserRepository.ts
│   ├── ProjectRepository.ts
│   ├── TaskRepository.ts
│   ├── MemberRepository.ts
│   └── ActivityRepository.ts
├── services/           # Business Logic Layer
│   ├── ProjectService.ts
│   ├── TaskService.ts
│   └── AuthService.ts
├── types/              # TypeScript Types
│   ├── index.ts       # DTOs, Enums, Errors
│   └── next-auth.d.ts # NextAuth types
└── middleware.ts       # Route protection
```

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Key Design Decisions

### 1. UUID Primary Keys

**Why**: Better for distributed systems, no auto-increment conflicts

### 2. Repository Pattern

**Why**:

- Testable without database
- Can swap ORMs easily
- Centralized query logic

### 3. Service Layer

**Why**:

- Business logic separate from data access
- Reusable across API routes and server actions
- Easier to test business rules

### 4. DTOs (Data Transfer Objects)

**Why**:

- Type-safe API contracts
- Input validation at type level
- Clear documentation

### 5. Activity Logging

**Why**:

- Audit trail for compliance
- User activity feed
- Debug production issues

### 6. Enum Tables in PostgreSQL

**Why**:

- Database-level constraints
- Better performance than string checks
- Type safety from DB to app

## Extending the System

### Adding a New Feature

Example: Add file attachments to tasks

1. **Update Schema** (`db/schema.ts`):

```typescript
export const attachments = pgTable('attachments', {
  id: uuid('id').defaultRandom().primaryKey(),
  taskId: uuid('task_id')
    .notNull()
    .references(() => tasks.id),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileUrl: text('file_url').notNull(),
  uploadedBy: uuid('uploaded_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

2. **Create Repository** (`repositories/AttachmentRepository.ts`):

```typescript
export class AttachmentRepository {
  async create(data: NewAttachment) { ... }
  async findByTask(taskId: string) { ... }
  async delete(id: string) { ... }
}
```

3. **Update Service** (`services/TaskService.ts`):

```typescript
async addAttachment(taskId: string, file: File, userId: string) {
  // Validate access
  // Upload file
  // Create attachment record
  // Log activity
}
```

4. **Add API Route** (`app/api/tasks/[id]/attachments/route.ts`):

```typescript
export async function POST(req, { params }) {
  // Handle file upload
  // Call service
  // Return response
}
```

5. **Create UI Component** (`components/tasks/AttachmentList.tsx`)

## Best Practices

### 1. Always Use Services in API Routes

❌ Don't call repositories directly:

```typescript
const project = await projectRepo.create(data);
```

✅ Use services:

```typescript
const project = await projectService.createProject(data, userId);
```

### 2. Validate at Multiple Layers

- **TypeScript types**: Compile-time safety
- **DTOs**: Structure validation
- **Service layer**: Business rule validation
- **Database**: Constraints and foreign keys

### 3. Log Important Actions

Always log:

- Create/update/delete operations
- Permission changes
- Status transitions

### 4. Use Transactions for Multi-Step Operations

```typescript
await db.transaction(async (tx) => {
  await tx.insert(projects).values(data);
  await tx.insert(projectMembers).values(member);
});
```

### 5. Handle Errors Consistently

```typescript
try {
  // Operation
} catch (error) {
  if (error instanceof AppError) {
    return { success: false, error: error.message };
  }
  return { success: false, error: 'Internal error' };
}
```

## Performance Considerations

1. **Database Indexes**: Created on foreign keys and frequently queried fields
2. **Pagination**: All list queries support pagination
3. **Selective Joins**: Only join tables when details are needed
4. **Caching**: Use Next.js revalidation for static pages
5. **Connection Pooling**: Drizzle manages PostgreSQL connections

## Testing Strategy

### Unit Tests

- Repository layer: Mock database
- Service layer: Mock repositories
- Utility functions: Pure function tests

### Integration Tests

- API routes: Test with test database
- Server actions: Test full flow
- Authentication: Test session handling

### E2E Tests

- User flows: Registration → Project creation → Task management
- Collaboration: Multiple users, role changes
- Access control: Verify permissions

## Deployment Checklist

- [ ] Set strong `NEXTAUTH_SECRET` in production
- [ ] Configure production `DATABASE_URL`
- [ ] Set up SSL for database connection
- [ ] Enable HTTPS for production site
- [ ] Set up database backups
- [ ] Configure rate limiting on API routes
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Run database migrations
- [ ] Test authentication flow
- [ ] Verify email uniqueness constraint

## Future Enhancements

- [ ] Email notifications for task assignments
- [ ] Real-time updates using WebSockets
- [ ] File attachments and storage (S3/CloudFlare R2)
- [ ] Advanced search with full-text indexing
- [ ] Project templates
- [ ] Time tracking on tasks
- [ ] Gantt chart visualization
- [ ] Export to PDF/Excel
- [ ] Two-factor authentication
- [ ] OAuth providers (Google, GitHub)

## Conclusion

This architecture provides a solid foundation for a scalable project management system. The clear separation of concerns makes it easy to maintain, test, and extend. Each layer has a specific purpose, and the type system ensures safety throughout the application.
