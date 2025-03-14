# Supabase Deployment Guide for Einstein Field Equations Platform

This guide will walk you through the process of deploying the Einstein Field Equations Platform to Supabase.

## Prerequisites

1. A Supabase account (sign up at [https://supabase.com](https://supabase.com))
2. The Supabase CLI installed on your machine
3. Node.js and npm installed

## Step 1: Create a New Supabase Project

1. Log in to your Supabase account at [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Enter a name for your project (e.g., "Einstein Field Equations")
4. Choose an organization
5. Set a secure database password
6. Choose a region closest to your users
7. Click "Create new project"

## Step 2: Set Up Environment Variables

Create a `.env` file in the root of your project with the following variables:

```
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your Supabase project dashboard under Settings > API.

## Step 3: Initialize Supabase in Your Project

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Initialize Supabase in your project
supabase init
```

## Step 4: Apply the Database Schema

1. Create a directory for migrations:

```bash
mkdir -p supabase/migrations
```

2. Copy the SQL schema file to the migrations directory:

```bash
cp supabase/migrations/20250314_initial_schema.sql supabase/migrations/
```

3. Link your local project to your Supabase project:

```bash
supabase link --project-ref your-project-ref
```

4. Push the schema to your Supabase project:

```bash
supabase db push
```

## Step 5: Deploy Edge Functions

1. Create the Edge Function directory:

```bash
mkdir -p supabase/functions/calculate
```

2. Copy the Edge Function code to the directory:

```bash
cp supabase/functions/calculate/index.ts supabase/functions/calculate/
```

3. Deploy the Edge Function:

```bash
supabase functions deploy calculate
```

## Step 6: Update Frontend Code

1. Install Supabase dependencies:

```bash
cd frontend
npm install @supabase/supabase-js
```

2. Ensure the following files are in place:

- `frontend/src/utils/supabase.js` - Supabase client configuration
- `frontend/src/utils/auth.js` - Authentication utilities
- `frontend/src/utils/calculations.js` - Calculation utilities
- `frontend/src/utils/visualizations.js` - Visualization utilities

## Step 7: Set Up Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure your site URL to match your frontend URL
3. Enable the authentication methods you want to use (Email, OAuth providers, etc.)
4. If using OAuth providers, configure their credentials in the respective sections

## Step 8: Set Up Storage

1. In your Supabase dashboard, go to Storage
2. Create a new bucket called "visualizations" for storing visualization thumbnails
3. Set the bucket's privacy settings according to your needs
4. Configure CORS settings if necessary

## Step 9: Test Your Deployment

1. Start your frontend application:

```bash
cd frontend
npm start
```

2. Test the following functionality:
   - User registration and login
   - Creating and retrieving calculations
   - Saving and loading visualizations
   - User preferences

## Troubleshooting

### Database Issues

If you encounter issues with the database schema:

1. Check the SQL logs in the Supabase dashboard
2. Verify that all extensions are enabled
3. Make sure the RLS policies are correctly set up

### Authentication Issues

If users can't sign up or log in:

1. Check the site URL configuration
2. Verify that the authentication methods are enabled
3. Check the browser console for errors

### Edge Function Issues

If the calculation Edge Function isn't working:

1. Check the function logs in the Supabase dashboard
2. Verify that the function is deployed correctly
3. Make sure the function has the necessary permissions

## Next Steps

1. Set up CI/CD for automatic deployments
2. Configure monitoring and alerts
3. Implement backup strategies
4. Optimize database queries and Edge Functions

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Auth](https://supabase.com/docs/guides/auth) 