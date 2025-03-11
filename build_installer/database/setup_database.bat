@echo off
echo Setting up PostgreSQL database...
set PGPASSWORD=postgres
"C:\Program Files\PostgreSQL\14\bin\psql.exe" -U postgres -f "%~dp0init_database.sql"
echo Database setup complete!
pause
