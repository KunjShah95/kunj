# Image Ink Studio - Jewelry Design Selection System

A collaborative platform for jewelry designers and administrators to mark, vote on, and select designs from collection images.

## 🎯 What This System Does

1. **Admin** uploads images containing multiple jewelry designs
2. **Designers** mark their favorite designs on the images
3. **Designers** vote on each other's selections
4. **Admin** reviews all markings and makes final production decisions
5. **Admin** exports selected designs with analytics

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Supabase account ([supabase.com](https://supabase.com))

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
copy .env.example .env

# Edit .env and add your Supabase credentials:
# VITE_SUPABASE_URL=your_supabase_project_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

1. Go to your Supabase SQL Editor
2. Run the SQL file: `JEWELRY_DESIGN_SCHEMA.sql`
3. Create a storage bucket named: `jewelry-designs` (make it public)

### Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

## 📖 Documentation

- **Complete System Guide**: See `JEWELRY_SYSTEM_GUIDE.md` for:
  - Database schema explained
  - Complete workflow examples
  - Frontend implementation guide
  - Analytics queries
  - Security features

## 🔐 Supabase Configuration

### 1. URL Configuration

In Supabase Dashboard → Authentication → URL Configuration:

- **Site URL**: `http://localhost:5173`
- **Redirect URLs**:
  - `http://localhost:5173`
  - `http://localhost:5173/**`

### 2. Email Confirmation (Optional)

For faster development, you can disable email confirmation:

- Go to Authentication → Settings
- Turn OFF "Enable email confirmations"
- Re-enable for production!

### 3. Storage Bucket

Create a public storage bucket:

- Name: `jewelry-designs`
- Public access: Enabled

## 👥 User Roles

### Admin Users

- Upload jewelry collection images
- View all designer markings and votes
- Make final selections for production
- Export selected designs
- Access: `/admin`

### Designer Users (Water)

- View all active collections
- Mark favorite designs on images
- Vote on other designers' selections
- Submit final selections
- Access: `/water`

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **Backend**: Supabase (Auth + Database + Storage)
- **UI Components**: shadcn/ui

## 📁 Project Structure

```text
kunj/
├── src/
│   ├── components/
│   │   └── ui/          # Reusable UI components
│   ├── lib/
│   │   └── supabase.ts  # Supabase client config
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DesignerPage.tsx
│   │   └── AdminCollectionsPage.tsx
│   ├── types/           # TypeScript type definitions
│   ├── App.tsx          # Main app with routing
│   └── main.tsx         # Entry point
├── JEWELRY_DESIGN_SCHEMA.sql  # Database schema
├── JEWELRY_SYSTEM_GUIDE.md    # Complete documentation
└── README.md            # This file
```

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Designers can only edit their own markings
- Admins can only manage their own collections
- All users can view (for collaboration)
- Email confirmation on signup (configurable)

## 📊 Key Features

✅ Multi-user collaboration  
✅ Real-time design marking  
✅ Voting system for popularity tracking  
✅ Admin approval workflow  
✅ Analytics and reports  
✅ Comment system for discussions  
✅ Export functionality for approved designs  

## 🐛 Troubleshooting

### "Failed to fetch" error on login/register

- Check that your `.env` file has correct Supabase credentials
- Verify Supabase project is active

### "Email not confirmed" error

- Check your email for confirmation link
- OR disable email confirmation in Supabase (dev only)

### Can't see uploaded images

- Verify storage bucket `jewelry-designs` exists
- Check bucket is set to public access
- Verify storage policies allow authenticated uploads

## 📝 License

MIT

## 🤝 Support

For issues or questions, refer to `JEWELRY_SYSTEM_GUIDE.md` for detailed documentation.
