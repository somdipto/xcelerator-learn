# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend Development
- `npm run dev` - Start development server with hot reload (runs on port 8081 if 8080 is occupied)
- `npm run build` - Production build 
- `npm run build:dev` - Development build
- `npm run lint` - Run ESLint (flat config)
- `npm run preview` - Preview production build

### Database Operations
- Database migrations are in `supabase/migrations/`
- Run migrations through Supabase CLI: `supabase db push`
- Latest migration: `20250622000000-create-core-tables.sql` (core table creation)

## Architecture Overview

This is a **K12 learning platform** built as a React SPA with Supabase backend:

### Frontend Stack
- **React 18 + TypeScript + Vite** - Modern SPA with fast development
- **UI**: Radix UI + shadcn/ui + Tailwind CSS (comprehensive design system)
- **State**: React Context for authentication
- **Routing**: React Router DOM v6

### Backend Architecture
- **Primary**: Supabase (PostgreSQL + Auth + Real-time)
- **File Storage**: Google Drive URLs with validation and embed conversion

### Authentication System
- Production Supabase authentication with email/password
- Role-based access: `student`, `teacher`, `admin`
- Authentication context in `src/contexts/AuthContext.tsx`
- Protected routes for teacher dashboard

## Database Schema

### Core Tables
- `profiles` - User profiles (links to auth.users)
- `subjects` - Curriculum subjects by grade
- `chapters` - Subject chapters with ordering
- `study_materials` - Learning content with Google Drive URLs
- `audit_logs` - Activity logging (admin only)

### Key Relationships
```
Grade (1-12) → Subject → Chapter → Study Material
Teacher → Multiple Subjects/Materials
```

## Content Management Strategy

### Google Drive Integration
- **URL Validation**: Supports drive.google.com and docs.google.com URLs
- **Embed Conversion**: Automatically converts share URLs to embed/preview URLs
- **Content Types**: Supports textbook, video, summary, ppt, quiz, pdf, document
- **File Management**: URLs stored in database, no local file storage

### Teacher CMS Features
- **Dashboard**: Teacher dashboard at `/teacher` (requires authentication)
- **Content Upload**: Google Drive URL-based content management
- **Subject/Chapter Creation**: Dynamic creation if not exists
- **Public Materials**: All uploaded materials are public for student access

## Component Architecture

### Authentication Components
- `AuthProvider` (contexts/AuthContext.tsx) - Main Supabase auth
- `TeacherLogin` - Teacher login page
- `ProtectedRoute` - Route protection wrapper

### Teacher Interface
- `SimplifiedTeacherDashboard` - Main teacher CMS portal
- `SecureStudyMaterialForm` - Content upload form
- `ContentList` - Material management interface

### Student Interface  
- `Index` - Student portal landing page
- `SubjectsPage` - Browse subjects by grade
- `ChapterStudyMaterial` - View study materials
- `PDFViewer` & `GoogleDriveEmbed` - Content viewers

### Navigation
- `TopNavigation` - Contains teacher login button
- `BottomNavigation` - Student app navigation
- `NotFound` - 404 error page

## Environment Configuration

### Required Variables (.env)
```
VITE_SUPABASE_URL=https://tjgyskkfhmcabtscsbvh.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

### Supabase Client Configuration
- Supports environment variables with fallback to hardcoded values
- Client configured in `src/integrations/supabase/client.ts`

## Service Layer Architecture

### Core Services
- `dataService.ts` - Database CRUD operations with Google Drive validation
- `authService.ts` - Legacy authentication service (not used)
- `googleDriveService.ts` - Google Drive URL processing
- `supabaseService.ts` - Legacy compatibility wrapper

### Key Features
- **URL Validation**: Comprehensive Google Drive URL validation
- **Error Handling**: Structured error responses with user-friendly messages
- **Type Safety**: Full TypeScript interfaces for all data structures
- **Audit Logging**: Automatic logging of sensitive operations

## Security Features

### Database Security
- Row Level Security (RLS) policies on all tables
- Role-based access control
- Audit logging for sensitive operations
- Input validation and sanitization

### Application Security
- Protected routes with authentication guards
- Secure authentication flow with proper session management
- Environment variable support for sensitive configuration
- Google Drive URL validation prevents malicious links

## Application Flow

### Student Flow
1. Visit `/` → Grade selection → Browse subjects/chapters → View materials

### Teacher Flow
1. Visit `/teacher-login` → Authenticate → Dashboard → Upload/manage content

### Authentication Flow
1. Teachers login with email/password (Supabase Auth)
2. Profile created automatically in profiles table
3. Role-based access to teacher dashboard
4. Session management with automatic redirects

## Development Notes

### Current Issues
- TypeScript lint warnings for `any` types (non-breaking)
- Development server runs on port 8081 if 8080 is occupied

### Testing Strategy
- No test runner configured yet
- Manual testing recommended for authentication and CRUD operations
- Test with real Google Drive URLs for content management

### Google Drive URL Formats Supported
- File sharing: `https://drive.google.com/file/d/ID/view`
- Documents: `https://docs.google.com/document/d/ID/`
- Spreadsheets: `https://docs.google.com/spreadsheets/d/ID/`
- Presentations: `https://docs.google.com/presentation/d/ID/`
- Forms: `https://docs.google.com/forms/d/ID/`

## Deployment

- Configured for Vercel deployment (vercel.json)
- Environment variables must be set in deployment platform
- Supabase migrations must be applied to production database
- Build output in `dist/` directory