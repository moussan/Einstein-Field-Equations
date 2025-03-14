# Einstein Field Equations Platform - Supabase Integration

This document provides an overview of the Supabase integration for the Einstein Field Equations Platform.

## Overview

The Einstein Field Equations Platform has been migrated to use Supabase as its backend infrastructure. Supabase provides a suite of tools that simplify backend development, including:

- PostgreSQL database
- Authentication and user management
- Storage for files and assets
- Realtime subscriptions
- Edge Functions for serverless computing

## Architecture

The Supabase integration consists of the following components:

### Database Schema

The database schema includes the following tables:

- `profiles`: User profiles linked to auth.users
- `calculations`: Records of calculations performed by users
- `saved_visualizations`: Saved visualization states
- `user_preferences`: User preferences and settings

All tables are protected by Row Level Security (RLS) policies to ensure data privacy and security.

### Authentication

Authentication is handled by Supabase Auth, which provides:

- Email/password authentication
- OAuth providers (GitHub, Google, etc.)
- JWT tokens for secure API access
- User management

### Storage

Supabase Storage is used to store:

- User avatars
- Visualization thumbnails
- Calculation results

### Edge Functions

Complex calculations are performed using Supabase Edge Functions:

- `calculate`: Performs various Einstein Field Equations calculations

## Frontend Integration

The frontend has been updated to use the Supabase JavaScript client. The integration includes:

- `supabase.js`: Supabase client configuration
- `auth.js`: Authentication utilities
- `calculations.js`: Calculation utilities
- `visualizations.js`: Visualization utilities

## Getting Started

To set up the Supabase integration:

1. Follow the instructions in `SUPABASE_DEPLOYMENT_GUIDE.md`
2. Run the `setup_supabase.js` script to automate the setup process

```bash
node setup_supabase.js
```

## Development Workflow

When developing with Supabase:

1. Make changes to the database schema in `supabase/migrations/`
2. Update Edge Functions in `supabase/functions/`
3. Push changes to Supabase using the CLI:

```bash
supabase db push
supabase functions deploy
```

## Local Development

For local development:

1. Start the Supabase local development server:

```bash
supabase start
```

2. Update your `.env` file to use the local Supabase URL and anon key
3. Start your frontend application

## Troubleshooting

See the `SUPABASE_DEPLOYMENT_GUIDE.md` file for troubleshooting tips.

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Auth](https://supabase.com/docs/guides/auth) 