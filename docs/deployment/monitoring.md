# Monitoring and Logging Setup for Einstein Field Equations Platform

This guide outlines how to set up monitoring and logging for your Supabase-powered Einstein Field Equations Platform to ensure optimal performance, detect issues early, and maintain system reliability.

## Table of Contents

1. [Supabase Built-in Monitoring](#supabase-built-in-monitoring)
2. [Database Performance Monitoring](#database-performance-monitoring)
3. [Edge Functions Monitoring](#edge-functions-monitoring)
4. [Frontend Application Monitoring](#frontend-application-monitoring)
5. [Alerting Setup](#alerting-setup)
6. [Log Management](#log-management)
7. [Backup and Recovery](#backup-and-recovery)

## Supabase Built-in Monitoring

Supabase provides built-in monitoring tools through the dashboard:

1. **Access the Dashboard**:
   - Log in to your Supabase account
   - Select your project
   - Navigate to the "Monitoring" section

2. **Database Health**:
   - Monitor active connections
   - Track database size
   - View query performance

3. **API Usage**:
   - Track API requests
   - Monitor bandwidth usage
   - Identify slow queries

## Database Performance Monitoring

For more advanced database monitoring:

1. **Enable PostgreSQL Metrics**:
   ```sql
   -- Enable pg_stat_statements extension if not already enabled
   CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
   
   -- Reset statistics (run periodically)
   SELECT pg_stat_statements_reset();
   ```

2. **Create a Monitoring Role**:
   ```sql
   -- Create a role for monitoring
   CREATE ROLE monitoring WITH LOGIN PASSWORD 'secure_password';
   
   -- Grant necessary permissions
   GRANT pg_monitor TO monitoring;
   ```

3. **Query for Slow Queries**:
   ```sql
   -- Find slow queries
   SELECT 
     query,
     calls,
     total_exec_time,
     mean_exec_time,
     max_exec_time
   FROM pg_stat_statements
   ORDER BY mean_exec_time DESC
   LIMIT 20;
   ```

4. **Set Up External Monitoring**:
   - Consider using [pganalyze](https://pganalyze.com/) for comprehensive PostgreSQL monitoring
   - Alternatively, use [Datadog PostgreSQL integration](https://docs.datadoghq.com/integrations/postgres/)

## Edge Functions Monitoring

Monitor your Edge Functions performance:

1. **Enable Detailed Logging**:
   - Update your Edge Functions to include detailed logging
   - Add timing information for critical operations

2. **Implement Health Check Endpoint**:
   Create a new Edge Function for health checks:

   ```typescript
   // supabase/functions/health/index.ts
   import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

   serve(async (req) => {
     const start = performance.now()
     
     // Check database connection
     const dbStatus = await checkDatabase()
     
     // Check other dependencies
     const otherStatus = await checkOtherDependencies()
     
     const responseTime = performance.now() - start
     
     return new Response(
       JSON.stringify({
         status: 'healthy',
         responseTime: `${responseTime.toFixed(2)}ms`,
         components: {
           database: dbStatus,
           otherDependencies: otherStatus
         }
       }),
       { headers: { 'Content-Type': 'application/json' } }
     )
   })

   async function checkDatabase() {
     try {
       // Implement a simple database check
       return { status: 'healthy' }
     } catch (error) {
       return { status: 'unhealthy', error: error.message }
     }
   }

   async function checkOtherDependencies() {
     // Check other dependencies
     return { status: 'healthy' }
   }
   ```

3. **Set Up External Monitoring**:
   - Use [Uptime Robot](https://uptimerobot.com/) to monitor your Edge Function endpoints
   - Set up [New Relic](https://newrelic.com/) for more detailed function monitoring

## Frontend Application Monitoring

Monitor your frontend application:

1. **Implement Error Tracking**:
   - Set up [Sentry](https://sentry.io/) for error tracking
   - Install the Sentry SDK in your frontend application:

   ```bash
   npm install @sentry/react
   ```

   - Initialize Sentry in your application:

   ```javascript
   // frontend/src/utils/sentry.js
   import * as Sentry from '@sentry/react';

   export const initSentry = () => {
     if (process.env.NODE_ENV === 'production') {
       Sentry.init({
         dsn: "YOUR_SENTRY_DSN",
         integrations: [
           new Sentry.BrowserTracing(),
         ],
         tracesSampleRate: 0.5,
       });
     }
   };
   ```

2. **Performance Monitoring**:
   - Use [Google Analytics](https://analytics.google.com/) for user behavior tracking
   - Implement [web-vitals](https://github.com/GoogleChrome/web-vitals) for performance metrics:

   ```bash
   npm install web-vitals
   ```

   ```javascript
   // frontend/src/utils/analytics.js
   import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';

   export function reportWebVitals(onPerfEntry) {
     if (onPerfEntry && onPerfEntry instanceof Function) {
       getCLS(onPerfEntry);
       getFID(onPerfEntry);
       getLCP(onPerfEntry);
       getFCP(onPerfEntry);
       getTTFB(onPerfEntry);
     }
   }
   ```

## Alerting Setup

Set up alerts to be notified of issues:

1. **Supabase Alerts**:
   - Configure email notifications for database usage limits
   - Set up alerts for Edge Function errors

2. **Custom Alerting with Uptime Robot**:
   - Create monitors for all critical endpoints
   - Configure SMS or email notifications
   - Set appropriate check intervals (1-5 minutes)

3. **PagerDuty Integration** (for teams):
   - Set up [PagerDuty](https://www.pagerduty.com/) for on-call rotations
   - Integrate with your monitoring tools

## Log Management

Centralize and analyze logs:

1. **Edge Function Logs**:
   - View logs in the Supabase dashboard
   - Consider forwarding logs to a centralized service

2. **Database Logs**:
   - Enable detailed PostgreSQL logging:

   ```sql
   ALTER SYSTEM SET log_min_duration_statement = '1000';  -- Log queries taking more than 1 second
   ALTER SYSTEM SET log_statement = 'ddl';                -- Log all DDL statements
   ALTER SYSTEM SET log_connections = 'on';               -- Log connections
   ALTER SYSTEM SET log_disconnections = 'on';            -- Log disconnections
   ```

3. **Centralized Logging**:
   - Consider using [Logtail](https://betterstack.com/logtail) or [Papertrail](https://www.papertrail.com/) for log aggregation
   - Set up log retention policies

## Backup and Recovery

Ensure data safety:

1. **Automated Backups**:
   - Supabase provides daily backups for paid plans
   - Set up additional backup strategies for critical data

2. **Manual Backup Script**:
   Create a script to perform manual backups:

   ```bash
   #!/bin/bash
   # backup.sh
   
   # Set variables
   DB_NAME="your_db_name"
   BACKUP_DIR="/path/to/backups"
   DATE=$(date +"%Y%m%d_%H%M%S")
   
   # Create backup directory if it doesn't exist
   mkdir -p $BACKUP_DIR
   
   # Run pg_dump (you'll need to set up appropriate connection details)
   PGPASSWORD=your_password pg_dump -h db.your-project-ref.supabase.co -U postgres -d $DB_NAME -F c -f $BACKUP_DIR/$DB_NAME-$DATE.dump
   
   # Delete backups older than 30 days
   find $BACKUP_DIR -name "*.dump" -type f -mtime +30 -delete
   ```

3. **Recovery Testing**:
   - Regularly test your backup restoration process
   - Document the recovery procedure

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Monitoring Guide](https://www.postgresql.org/docs/current/monitoring.html)
- [Deno Deploy Monitoring](https://deno.com/deploy/docs/metrics-and-logs)

---

Remember to adjust these monitoring strategies based on your specific needs and traffic patterns. Start with basic monitoring and expand as your application grows. 