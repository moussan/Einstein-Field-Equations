
-- Create database and user
CREATE DATABASE einstein_field_equations;
CREATE USER efeuser WITH ENCRYPTED PASSWORD 'efepassword';
GRANT ALL PRIVILEGES ON DATABASE einstein_field_equations TO efeuser;

-- Connect to the database
\c einstein_field_equations

-- Additional setup can be added here
