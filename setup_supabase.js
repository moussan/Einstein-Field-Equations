#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

console.log(`${colors.bright}${colors.cyan}
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   Einstein Field Equations Platform - Supabase Setup Script   ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
${colors.reset}`);

// Check if Supabase CLI is installed
function checkSupabaseCLI() {
  try {
    execSync('supabase --version', { stdio: 'ignore' });
    console.log(`${colors.green}✓ Supabase CLI is installed${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Supabase CLI is not installed${colors.reset}`);
    console.log(`${colors.yellow}Please install it with: npm install -g supabase${colors.reset}`);
    return false;
  }
}

// Create necessary directories
function createDirectories() {
  const directories = [
    'supabase',
    'supabase/migrations',
    'supabase/functions',
    'supabase/functions/calculate'
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`${colors.green}✓ Created directory: ${dir}${colors.reset}`);
    } else {
      console.log(`${colors.yellow}! Directory already exists: ${dir}${colors.reset}`);
    }
  });
}

// Create .env file
function createEnvFile(supabaseUrl, supabaseAnonKey) {
  const envContent = `REACT_APP_SUPABASE_URL=${supabaseUrl}
REACT_APP_SUPABASE_ANON_KEY=${supabaseAnonKey}
`;

  fs.writeFileSync('.env', envContent);
  console.log(`${colors.green}✓ Created .env file${colors.reset}`);
}

// Initialize Supabase project
function initializeSupabase() {
  try {
    execSync('supabase init', { stdio: 'inherit' });
    console.log(`${colors.green}✓ Initialized Supabase project${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Failed to initialize Supabase project${colors.reset}`);
    console.log(`${colors.yellow}Error: ${error.message}${colors.reset}`);
    return false;
  }
}

// Link to remote Supabase project
function linkSupabaseProject(projectRef) {
  try {
    execSync(`supabase link --project-ref ${projectRef}`, { stdio: 'inherit' });
    console.log(`${colors.green}✓ Linked to Supabase project: ${projectRef}${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Failed to link to Supabase project${colors.reset}`);
    console.log(`${colors.yellow}Error: ${error.message}${colors.reset}`);
    return false;
  }
}

// Push database schema
function pushDatabaseSchema() {
  try {
    execSync('supabase db push', { stdio: 'inherit' });
    console.log(`${colors.green}✓ Pushed database schema to Supabase${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Failed to push database schema${colors.reset}`);
    console.log(`${colors.yellow}Error: ${error.message}${colors.reset}`);
    return false;
  }
}

// Deploy Edge Functions
function deployEdgeFunctions() {
  try {
    execSync('supabase functions deploy calculate', { stdio: 'inherit' });
    console.log(`${colors.green}✓ Deployed calculate Edge Function${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Failed to deploy Edge Function${colors.reset}`);
    console.log(`${colors.yellow}Error: ${error.message}${colors.reset}`);
    return false;
  }
}

// Main function
async function main() {
  // Check prerequisites
  if (!checkSupabaseCLI()) {
    rl.close();
    return;
  }

  // Create directories
  createDirectories();

  // Get Supabase project details
  rl.question(`${colors.cyan}Enter your Supabase project reference (found in project URL): ${colors.reset}`, (projectRef) => {
    rl.question(`${colors.cyan}Enter your Supabase URL (https://your-project-id.supabase.co): ${colors.reset}`, (supabaseUrl) => {
      rl.question(`${colors.cyan}Enter your Supabase anon key: ${colors.reset}`, (supabaseAnonKey) => {
        // Create .env file
        createEnvFile(supabaseUrl, supabaseAnonKey);

        // Initialize Supabase
        if (!initializeSupabase()) {
          rl.close();
          return;
        }

        // Link to remote project
        if (!linkSupabaseProject(projectRef)) {
          rl.close();
          return;
        }

        // Push database schema
        console.log(`${colors.yellow}Pushing database schema to Supabase...${colors.reset}`);
        if (!pushDatabaseSchema()) {
          rl.close();
          return;
        }

        // Deploy Edge Functions
        console.log(`${colors.yellow}Deploying Edge Functions...${colors.reset}`);
        if (!deployEdgeFunctions()) {
          rl.close();
          return;
        }

        console.log(`${colors.bright}${colors.green}
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   Supabase setup completed successfully!                      ║
║                                                               ║
║   Next steps:                                                 ║
║   1. Configure authentication in the Supabase dashboard       ║
║   2. Set up storage buckets for visualizations                ║
║   3. Update your frontend to use Supabase                     ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
${colors.reset}`);

        rl.close();
      });
    });
  });
}

// Run the script
main().catch(error => {
  console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  rl.close();
}); 