
# Teacher CMS

A modern Teacher Content Management System built with React, TypeScript, and Supabase.

## Features

- 🎓 Teacher Dashboard with content management
- 📚 Study materials upload and organization
- 🔐 Secure authentication system
- 📱 Responsive design for all devices
- 🚀 Fast performance with optimized builds

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd teacher-cms
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your Supabase credentials.

4. **Start development server**
   ```bash
   npm run dev
   ```

## Environment Variables

Required environment variables for deployment:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on git push

### Manual Build

```bash
npm run build
```

The build output will be in the `dist` directory.

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Database, Auth, Storage)
- **State Management**: TanStack Query
- **Routing**: React Router DOM

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License
