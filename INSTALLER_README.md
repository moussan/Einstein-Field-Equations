# Einstein Field Equations Platform - Windows Installer

This directory contains scripts to build a Windows installer for the Einstein Field Equations Platform. The installer bundles all necessary components, including the Python backend, React frontend, and PostgreSQL database.

## Building the Installer

### Prerequisites

- Windows 10 or later
- Python 3.9 or later
- Internet connection to download dependencies

### Steps to Build

1. Run the `build_installer.bat` script:
   ```
   build_installer.bat
   ```

2. The script will:
   - Download all necessary prerequisites (Python, Node.js, PostgreSQL, Inno Setup)
   - Build the backend and frontend components
   - Create database setup scripts
   - Package everything into a Windows installer

3. Once completed, the installer will be available in the `dist` directory as `Einstein_Field_Equations_Setup.exe`.

## Using the Installer

The installer will:

1. Install Python 3.9
2. Install Node.js
3. Install PostgreSQL
4. Install the Einstein Field Equations Platform
5. Set up the database
6. Create shortcuts in the Start Menu and optionally on the Desktop

## Running the Application

After installation:

1. Launch the application from the Start Menu or Desktop shortcut
2. The application will:
   - Start PostgreSQL if it's not already running
   - Start the backend server
   - Start the frontend server
   - Open your default web browser to the application

## Troubleshooting

If you encounter issues:

1. **Database Connection Issues**:
   - Run the "Setup Database" shortcut from the Start Menu
   - Check that PostgreSQL is running (Services app in Windows)

2. **Backend Issues**:
   - Check the backend logs in the installation directory under `backend/logs`

3. **Frontend Issues**:
   - Try accessing the frontend directly at http://localhost:3000

## Technical Details

The installer is built using:

- Inno Setup for the installer package
- Python's virtual environment for isolating dependencies
- PostgreSQL for the database
- A simple HTTP server for serving the frontend

The application components are:

- Backend: FastAPI (Python)
- Frontend: React
- Database: PostgreSQL

## Customization

You can customize the installer by modifying:

- `build_windows_installer.py` - Main build script
- `installer.iss` (generated) - Inno Setup script

## License

This installer and the Einstein Field Equations Platform are licensed under the MIT License. 