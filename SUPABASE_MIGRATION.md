# Migrating to Supabase

This document outlines the process of migrating the Einstein Field Equations Platform from a traditional backend to Supabase for higher efficiency and centralized resources.

## Why Supabase?

Supabase offers several advantages for our application:

1. **Centralized Backend Services**: PostgreSQL database, authentication, storage, and real-time subscriptions in one platform.
2. **Higher Efficiency**: Managed infrastructure eliminates the need to maintain separate PostgreSQL and Redis instances.
3. **Powerful Features**: Real-time subscriptions, built-in authentication, vector search capabilities, and edge functions.
4. **Developer Experience**: Comprehensive JavaScript/TypeScript client libraries, database migrations, and version control.

## Migration Steps

### 1. Setup Supabase Project

1. Create a new Supabase project at [https://app.supabase.com](https://app.supabase.com)
2. Note your project URL and anon key for configuration

### 2. Configure Environment Variables

Create a `.env` file in the project root with the following variables:

```
REACT_APP_SUPABASE_URL=your-project-url
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

For local development with Supabase CLI, create a `.env.local` file:

```
SUPABASE_AUTH_GITHUB_CLIENT_ID=your-github-client-id
SUPABASE_AUTH_GITHUB_SECRET=your-github-secret
```

### 3. Initialize Supabase Locally

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase in your project
supabase init

# Start Supabase locally
supabase start
```

### 4. Apply Database Migrations

```bash
# Apply the initial schema migration
supabase db push
```

### 5. Deploy Edge Functions

```bash
# Deploy the calculation edge function
supabase functions deploy calculate
```

### 6. Update Frontend Code

1. Install Supabase dependencies:
   ```bash
   npm install @supabase/supabase-js
   ```

2. Update your frontend code to use the Supabase client for:
   - Authentication
   - Database operations
   - Storage operations

### 7. Data Migration

1. Export data from your existing PostgreSQL database:
   ```bash
   pg_dump -U postgres -h localhost -p 5432 -d einstein_field_equations > data_dump.sql
   ```

2. Import data to Supabase:
   ```bash
   supabase db reset --db-url postgresql://postgres:postgres@localhost:54322/postgres
   psql -h localhost -p 54322 -U postgres -d postgres -f data_dump.sql
   ```

## Project Structure

The migration introduces the following new files and directories:

- `supabase/` - Contains Supabase configuration and migrations
  - `migrations/` - SQL migrations for the database schema
  - `functions/` - Edge functions for serverless computation
  - `config.toml` - Supabase configuration file

- `frontend/src/utils/` - Contains utility functions for Supabase
  - `supabase.js` - Supabase client configuration
  - `auth.js` - Authentication utilities
  - `calculations.js` - Calculation utilities
  - `visualizations.js` - Visualization utilities

## Authentication

Authentication has been migrated from the custom JWT implementation to Supabase Auth, which provides:

- Email/password authentication
- OAuth providers (GitHub, Google, etc.)
- Row-level security policies
- JWT tokens with customizable expiry

## Database

The database schema has been migrated to Supabase with the following tables:

- `profiles` - User profiles linked to auth.users
- `calculations` - Calculation records
- `saved_visualizations` - Saved visualization states
- `user_preferences` - User preferences and settings

## Edge Functions

Complex calculations are now performed using Supabase Edge Functions:

- `calculate` - Performs various Einstein Field Equations calculations

## Next Steps

1. **Testing**: Thoroughly test all functionality with the new Supabase backend
2. **Optimization**: Optimize database queries and edge functions
3. **Monitoring**: Set up monitoring and alerts for the Supabase project
4. **Documentation**: Update API documentation to reflect the new Supabase endpoints

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Auth](https://supabase.com/docs/guides/auth) 