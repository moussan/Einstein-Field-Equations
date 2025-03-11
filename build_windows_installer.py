"""
Einstein Field Equations Platform - Windows Installer Builder

This script creates a Windows installer that bundles:
1. Python backend with all dependencies
2. React frontend
3. PostgreSQL database
4. Startup scripts

Requirements:
- Python 3.9+
- Node.js and npm
- Inno Setup (for creating the installer)
- PostgreSQL installer
"""

import os
import sys
import subprocess
import shutil
import tempfile
import urllib.request
import zipfile

# Configuration
PYTHON_VERSION = "3.9.13"
NODE_VERSION = "16.15.1"
POSTGRESQL_VERSION = "14.5-1"
INNO_SETUP_VERSION = "6.2.0"

# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BUILD_DIR = os.path.join(SCRIPT_DIR, "build_installer")
DIST_DIR = os.path.join(SCRIPT_DIR, "dist")
TEMP_DIR = os.path.join(BUILD_DIR, "temp")
DOWNLOADS_DIR = os.path.join(BUILD_DIR, "downloads")

# URLs
PYTHON_URL = f"https://www.python.org/ftp/python/{PYTHON_VERSION}/python-{PYTHON_VERSION}-amd64.exe"
NODE_URL = f"https://nodejs.org/dist/v{NODE_VERSION}/node-v{NODE_VERSION}-x64.msi"
POSTGRESQL_URL = f"https://get.enterprisedb.com/postgresql/postgresql-{POSTGRESQL_VERSION}-windows-x64.exe"
INNO_SETUP_URL = f"https://files.jrsoftware.org/is/6/innosetup-{INNO_SETUP_VERSION}.exe"

def ensure_directory(directory):
    """Ensure a directory exists, creating it if necessary."""
    if not os.path.exists(directory):
        os.makedirs(directory)

def download_file(url, destination, force=False):
    """Download a file from a URL to a destination."""
    if not os.path.exists(destination) or force:
        print(f"Downloading {url} to {destination}")
        urllib.request.urlretrieve(url, destination)
    else:
        print(f"File already exists: {destination}")

def run_command(command, cwd=None):
    """Run a command and return its output."""
    print(f"Running command: {command}")
    try:
        result = subprocess.run(command, cwd=cwd, shell=True, 
                               stdout=subprocess.PIPE, stderr=subprocess.PIPE, 
                               text=True)
        
        # Check if command was successful
        if result.returncode != 0:
            print(f"Command failed with exit code {result.returncode}")
            print("STDOUT:")
            print(result.stdout)
            print("STDERR:")
            print(result.stderr)
            raise Exception(f"Command '{command}' returned non-zero exit status {result.returncode}")
        
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"Command execution failed: {str(e)}")
        if hasattr(e, 'output') and e.output:
            print(f"Output: {e.output}")
        if hasattr(e, 'stderr') and e.stderr:
            print(f"Error: {e.stderr}")
        raise
    except Exception as e:
        print(f"Error executing command: {str(e)}")
        raise

def build_backend():
    """Build the Python backend."""
    print("Building backend...")
    backend_build_dir = os.path.join(BUILD_DIR, "backend")
    ensure_directory(backend_build_dir)
    
    # Copy backend files
    backend_src = os.path.join(SCRIPT_DIR, "backend")
    shutil.copytree(backend_src, backend_build_dir, dirs_exist_ok=True)
    
    # Create virtual environment
    venv_dir = os.path.join(backend_build_dir, "venv")
    run_command(f"python -m venv {venv_dir}")
    
    # Install dependencies
    pip = os.path.join(venv_dir, "Scripts", "pip.exe")
    run_command(f'"{pip}" install -r requirements.txt', cwd=backend_build_dir)
    
    # Create a launcher script
    with open(os.path.join(backend_build_dir, "start_backend.bat"), "w") as f:
        f.write(f"""@echo off
call "%~dp0venv\\Scripts\\activate.bat"
cd "%~dp0app"
python -m uvicorn main:app --host 0.0.0.0 --port 8000
""")
    
    return backend_build_dir

def build_frontend():
    """Build the React frontend."""
    print("Building frontend...")
    frontend_src = os.path.join(SCRIPT_DIR, "frontend")
    frontend_build_dir = os.path.join(BUILD_DIR, "frontend")
    ensure_directory(frontend_build_dir)
    
    # Check if frontend directory exists
    if not os.path.exists(frontend_src):
        print(f"Warning: Frontend directory not found at {frontend_src}")
        print("Creating a minimal frontend placeholder instead.")
        
        # Create a minimal frontend placeholder
        create_minimal_frontend(frontend_build_dir)
    else:
        # Copy frontend files
        print(f"Copying frontend files from {frontend_src} to {frontend_build_dir}")
        shutil.copytree(frontend_src, frontend_build_dir, dirs_exist_ok=True)
        
        try:
            # Check if package.json exists
            if not os.path.exists(os.path.join(frontend_build_dir, "package.json")):
                raise Exception("package.json not found in frontend directory")
            
            # Check if src/index.js exists
            if not os.path.exists(os.path.join(frontend_build_dir, "src", "index.js")):
                print("Warning: src/index.js not found. Creating a minimal React app structure.")
                create_minimal_react_app(frontend_build_dir)
            
            # Install dependencies
            print("Installing frontend dependencies...")
            try:
                run_command("npm install", cwd=frontend_build_dir)
            except Exception as e:
                print(f"Warning: npm install failed: {str(e)}")
                print("Continuing with build process...")
            
            # Try to build
            print("Building frontend production build...")
            try:
                run_command("npm run build", cwd=frontend_build_dir)
            except Exception as e:
                print(f"Error: npm run build failed: {str(e)}")
                print("Creating a minimal frontend placeholder instead.")
                create_minimal_frontend(frontend_build_dir)
        except Exception as e:
            print(f"Error during frontend build: {str(e)}")
            print("Creating a minimal frontend placeholder...")
            create_minimal_frontend(frontend_build_dir)
    
    # Create a launcher script using a simple HTTP server
    with open(os.path.join(frontend_build_dir, "start_frontend.bat"), "w") as f:
        f.write(f"""@echo off
cd "%~dp0build"
start "" http://localhost:3000
python -m http.server 3000
""")
    
    return frontend_build_dir

def create_minimal_frontend(frontend_dir):
    """Create a minimal frontend placeholder."""
    build_dir = os.path.join(frontend_dir, "build")
    os.makedirs(build_dir, exist_ok=True)
    
    with open(os.path.join(build_dir, "index.html"), "w") as f:
        f.write("""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Einstein Field Equations Platform</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #121212;
            color: #ffffff;
        }
        .container {
            text-align: center;
            max-width: 800px;
            padding: 20px;
        }
        h1 {
            color: #4caf50;
        }
        .api-link {
            margin-top: 20px;
            padding: 10px;
            background-color: #333;
            border-radius: 5px;
        }
        a {
            color: #4caf50;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Einstein Field Equations Platform</h1>
        <p>The frontend build was not available during installation. This is a placeholder page.</p>
        <p>You can still access the API directly:</p>
        <div class="api-link">
            <a href="http://localhost:8000/docs" target="_blank">API Documentation</a>
        </div>
    </div>
</body>
</html>""")

def create_minimal_react_app(frontend_dir):
    """Create a minimal React app structure."""
    src_dir = os.path.join(frontend_dir, "src")
    os.makedirs(src_dir, exist_ok=True)
    
    # Create index.js
    with open(os.path.join(src_dir, "index.js"), "w") as f:
        f.write("""import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
""")
    
    # Create index.css
    with open(os.path.join(src_dir, "index.css"), "w") as f:
        f.write("""body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #121212;
  color: #ffffff;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
""")
    
    # Create App.js
    with open(os.path.join(src_dir, "App.js"), "w") as f:
        f.write("""import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Einstein Field Equations Platform</h1>
        <p>
          A comprehensive platform for calculating and visualizing Einstein's Field Equations.
        </p>
        <a
          className="App-link"
          href="http://localhost:8000/docs"
          target="_blank"
          rel="noopener noreferrer"
        >
          API Documentation
        </a>
      </header>
    </div>
  );
}

export default App;
""")
    
    # Create App.css
    with open(os.path.join(src_dir, "App.css"), "w") as f:
        f.write(""".App {
  text-align: center;
}

.App-header {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
}

.App-link {
  color: #4caf50;
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #333;
  border-radius: 5px;
  text-decoration: none;
}

.App-link:hover {
  text-decoration: underline;
}
""")
    
    # Create public directory
    public_dir = os.path.join(frontend_dir, "public")
    os.makedirs(public_dir, exist_ok=True)
    
    # Create index.html
    with open(os.path.join(public_dir, "index.html"), "w") as f:
        f.write("""<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Einstein Field Equations Computational Platform"
    />
    <title>Einstein Field Equations Platform</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
""")
    
    # Update package.json if it exists
    package_json_path = os.path.join(frontend_dir, "package.json")
    if os.path.exists(package_json_path):
        try:
            import json
            with open(package_json_path, 'r') as f:
                package_data = json.load(f)
            
            # Ensure scripts section exists with build command
            if 'scripts' not in package_data:
                package_data['scripts'] = {}
            
            if 'build' not in package_data['scripts']:
                package_data['scripts']['build'] = 'react-scripts build'
            
            # Ensure dependencies include React
            if 'dependencies' not in package_data:
                package_data['dependencies'] = {}
            
            if 'react' not in package_data['dependencies']:
                package_data['dependencies']['react'] = '^18.2.0'
            
            if 'react-dom' not in package_data['dependencies']:
                package_data['dependencies']['react-dom'] = '^18.2.0'
            
            if 'react-scripts' not in package_data['dependencies']:
                package_data['dependencies']['react-scripts'] = '5.0.1'
            
            # Write updated package.json
            with open(package_json_path, 'w') as f:
                json.dump(package_data, f, indent=2)
            
            print("Updated package.json with required React dependencies and scripts.")
        except Exception as e:
            print(f"Error updating package.json: {str(e)}")
            # Create a new package.json if update fails
            create_package_json(frontend_dir)
    else:
        # Create package.json if it doesn't exist
        create_package_json(frontend_dir)

def create_package_json(frontend_dir):
    """Create a minimal package.json file."""
    with open(os.path.join(frontend_dir, "package.json"), "w") as f:
        f.write("""{
  "name": "einstein-field-equations-platform",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}""")

def create_database_setup():
    """Create database setup scripts."""
    print("Creating database setup scripts...")
    db_setup_dir = os.path.join(BUILD_DIR, "database")
    ensure_directory(db_setup_dir)
    
    # Create initialization script
    with open(os.path.join(db_setup_dir, "init_database.sql"), "w") as f:
        f.write("""
-- Create database and user
CREATE DATABASE einstein_field_equations;
CREATE USER efeuser WITH ENCRYPTED PASSWORD 'efepassword';
GRANT ALL PRIVILEGES ON DATABASE einstein_field_equations TO efeuser;

-- Connect to the database
\\c einstein_field_equations

-- Additional setup can be added here
""")
    
    # Create setup batch file
    with open(os.path.join(db_setup_dir, "setup_database.bat"), "w") as f:
        f.write("""@echo off
echo Setting up PostgreSQL database...
set PGPASSWORD=postgres
"C:\\Program Files\\PostgreSQL\\14\\bin\\psql.exe" -U postgres -f "%~dp0init_database.sql"
echo Database setup complete!
pause
""")
    
    return db_setup_dir

def create_main_launcher():
    """Create the main launcher script."""
    print("Creating main launcher...")
    with open(os.path.join(BUILD_DIR, "Einstein_Field_Equations.bat"), "w") as f:
        f.write("""@echo off
echo Starting Einstein Field Equations Platform...

REM Start PostgreSQL if not running
sc query postgresql-x64-14 | find "RUNNING" > nul
if errorlevel 1 (
    echo Starting PostgreSQL...
    net start postgresql-x64-14
)

REM Start backend
start cmd /k "%~dp0backend\\start_backend.bat"

REM Wait for backend to start
echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

REM Start frontend
start cmd /k "%~dp0frontend\\start_frontend.bat"

REM Open browser
start http://localhost:3000
""")

def create_inno_setup_script():
    """Create the Inno Setup script."""
    print("Creating Inno Setup script...")
    with open(os.path.join(BUILD_DIR, "installer.iss"), "w") as f:
        f.write(f"""#define MyAppName "Einstein Field Equations Platform"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Einstein Field Equations Team"
#define MyAppURL "https://github.com/yourusername/Einstein-Field-Equations"
#define MyAppExeName "Einstein_Field_Equations.bat"

[Setup]
AppId={{{{8A7D8AE1-9F0D-4B8B-B154-A1D7F7E5E1E9}}}}
AppName={{#MyAppName}}
AppVersion={{#MyAppVersion}}
AppPublisher={{#MyAppPublisher}}
AppPublisherURL={{#MyAppURL}}
AppSupportURL={{#MyAppURL}}
AppUpdatesURL={{#MyAppURL}}
DefaultDirName={{autopf}}\\{{#MyAppName}}
DefaultGroupName={{#MyAppName}}
AllowNoIcons=yes
LicenseFile={SCRIPT_DIR}\\LICENSE
OutputDir={DIST_DIR}
OutputBaseFilename=Einstein_Field_Equations_Setup
Compression=lzma
SolidCompression=yes
WizardStyle=modern
SetupIconFile={BUILD_DIR}\\app_icon.ico
UninstallDisplayIcon={{app}}\\app_icon.ico

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{{cm:CreateDesktopIcon}}"; GroupDescription: "{{cm:AdditionalIcons}}"; Flags: unchecked

[Files]
; Main application files
Source: "{BUILD_DIR}\\*"; DestDir: "{{app}}"; Flags: ignoreversion recursesubdirs createallsubdirs

; Prerequisites
Source: "{DOWNLOADS_DIR}\\python-{PYTHON_VERSION}-amd64.exe"; DestDir: "{{tmp}}"; Flags: deleteafterinstall
Source: "{DOWNLOADS_DIR}\\node-v{NODE_VERSION}-x64.msi"; DestDir: "{{tmp}}"; Flags: deleteafterinstall
Source: "{DOWNLOADS_DIR}\\postgresql-{POSTGRESQL_VERSION}-windows-x64.exe"; DestDir: "{{tmp}}"; Flags: deleteafterinstall

[Icons]
Name: "{{group}}\\{{#MyAppName}}"; Filename: "{{app}}\\{{#MyAppExeName}}"
Name: "{{group}}\\Setup Database"; Filename: "{{app}}\\database\\setup_database.bat"
Name: "{{group}}\\{{cm:UninstallProgram,{{#MyAppName}}}}"; Filename: "{{uninstallexe}}"
Name: "{{commondesktop}}\\{{#MyAppName}}"; Filename: "{{app}}\\{{#MyAppExeName}}"; Tasks: desktopicon

[Run]
; Install Python
Filename: "{{tmp}}\\python-{PYTHON_VERSION}-amd64.exe"; Parameters: "/quiet InstallAllUsers=1 PrependPath=1"; StatusMsg: "Installing Python..."; Flags: runhidden shellexec; Check: FileExists('{{tmp}}\\python-{PYTHON_VERSION}-amd64.exe')

; Install Node.js
Filename: "msiexec.exe"; Parameters: "/i ""{{tmp}}\\node-v{NODE_VERSION}-x64.msi"" /quiet /norestart"; StatusMsg: "Installing Node.js..."; Flags: runhidden shellexec; Check: FileExists('{{tmp}}\\node-v{NODE_VERSION}-x64.msi')

; Install PostgreSQL
Filename: "{{tmp}}\\postgresql-{POSTGRESQL_VERSION}-windows-x64.exe"; Parameters: "--unattendedmodeui minimal --mode unattended --superpassword postgres"; StatusMsg: "Installing PostgreSQL..."; Flags: runhidden shellexec; Check: FileExists('{{tmp}}\\postgresql-{POSTGRESQL_VERSION}-windows-x64.exe')

; Setup Database
Filename: "{{app}}\\database\\setup_database.bat"; Description: "Setup Database"; Flags: postinstall runascurrentuser

; Launch application
Filename: "{{app}}\\{{#MyAppExeName}}"; Description: "{{cm:LaunchProgram,{{#StringChange(MyAppName, '&', '&&')}}}}"; Flags: nowait postinstall skipifsilent

[Code]
function InitializeSetup(): Boolean;
begin
  Result := True;
  
  // Check if prerequisites exist
  if not FileExists(ExpandConstant('{{tmp}}\\node-v{NODE_VERSION}-x64.msi')) then
  begin
    MsgBox('Node.js installer not found or corrupted. The application will be installed but Node.js will not be installed automatically.', mbInformation, MB_OK);
  end;
  
  if not FileExists(ExpandConstant('{{tmp}}\\postgresql-{POSTGRESQL_VERSION}-windows-x64.exe')) then
  begin
    MsgBox('PostgreSQL installer not found or corrupted. The application will be installed but PostgreSQL will not be installed automatically.', mbInformation, MB_OK);
  end;
  
  if not FileExists(ExpandConstant('{{tmp}}\\python-{PYTHON_VERSION}-amd64.exe')) then
  begin
    MsgBox('Python installer not found or corrupted. The application will be installed but Python will not be installed automatically.', mbInformation, MB_OK);
  end;
end;
""")

def download_prerequisites():
    """Download all prerequisites."""
    print("Downloading prerequisites...")
    ensure_directory(DOWNLOADS_DIR)
    
    # Update Node.js version to a more recent one
    global NODE_VERSION
    NODE_VERSION = "18.16.1"  # More recent LTS version
    global NODE_URL
    NODE_URL = f"https://nodejs.org/dist/v{NODE_VERSION}/node-v{NODE_VERSION}-x64.msi"
    
    # Download Python
    python_file = os.path.join(DOWNLOADS_DIR, f"python-{PYTHON_VERSION}-amd64.exe")
    download_file(PYTHON_URL, python_file)
    if not os.path.exists(python_file) or os.path.getsize(python_file) < 1000000:
        print(f"Warning: Python installer may be corrupted or incomplete: {python_file}")
        if os.path.exists(python_file):
            os.remove(python_file)
        print("Retrying download...")
        download_file(PYTHON_URL, python_file, force=True)
    
    # Download Node.js
    node_file = os.path.join(DOWNLOADS_DIR, f"node-v{NODE_VERSION}-x64.msi")
    download_file(NODE_URL, node_file)
    if not os.path.exists(node_file) or os.path.getsize(node_file) < 1000000:
        print(f"Warning: Node.js installer may be corrupted or incomplete: {node_file}")
        if os.path.exists(node_file):
            os.remove(node_file)
        print("Retrying download...")
        download_file(NODE_URL, node_file, force=True)
    
    # Download PostgreSQL
    pg_file = os.path.join(DOWNLOADS_DIR, f"postgresql-{POSTGRESQL_VERSION}-windows-x64.exe")
    download_file(POSTGRESQL_URL, pg_file)
    if not os.path.exists(pg_file) or os.path.getsize(pg_file) < 1000000:
        print(f"Warning: PostgreSQL installer may be corrupted or incomplete: {pg_file}")
        if os.path.exists(pg_file):
            os.remove(pg_file)
        print("Retrying download...")
        download_file(POSTGRESQL_URL, pg_file, force=True)
    
    # Download Inno Setup
    inno_file = os.path.join(DOWNLOADS_DIR, f"innosetup-{INNO_SETUP_VERSION}.exe")
    download_file(INNO_SETUP_URL, inno_file)
    if not os.path.exists(inno_file) or os.path.getsize(inno_file) < 1000000:
        print(f"Warning: Inno Setup installer may be corrupted or incomplete: {inno_file}")
        if os.path.exists(inno_file):
            os.remove(inno_file)
        print("Retrying download...")
        download_file(INNO_SETUP_URL, inno_file, force=True)
    
    # Download a sample icon
    icon_url = "https://www.iconarchive.com/download/i103365/paomedia/small-n-flat/calculator.ico"
    icon_file = os.path.join(BUILD_DIR, "app_icon.ico")
    download_file(icon_url, icon_file)
    if not os.path.exists(icon_file) or os.path.getsize(icon_file) < 1000:
        print(f"Warning: Icon file may be corrupted or incomplete: {icon_file}")
        if os.path.exists(icon_file):
            os.remove(icon_file)
        print("Retrying download...")
        download_file(icon_url, icon_file, force=True)

def build_installer():
    """Build the installer using Inno Setup."""
    print("Building installer...")
    inno_setup_path = os.path.join(os.environ.get("ProgramFiles(x86)", "C:\\Program Files (x86)"), 
                                  "Inno Setup 6", "ISCC.exe")
    
    # Install Inno Setup if not found
    if not os.path.exists(inno_setup_path):
        print("Installing Inno Setup...")
        inno_setup_installer = os.path.join(DOWNLOADS_DIR, f"innosetup-{INNO_SETUP_VERSION}.exe")
        run_command(f'"{inno_setup_installer}" /VERYSILENT /SUPPRESSMSGBOXES /NORESTART')
    
    # Build the installer
    run_command(f'"{inno_setup_path}" "{os.path.join(BUILD_DIR, "installer.iss")}"')
    
    print(f"Installer created at: {os.path.join(DIST_DIR, 'Einstein_Field_Equations_Setup.exe')}")

def main():
    """Main function."""
    print("Building Einstein Field Equations Platform Windows Installer")
    
    # Create directories
    ensure_directory(BUILD_DIR)
    ensure_directory(DIST_DIR)
    ensure_directory(TEMP_DIR)
    
    success = True
    
    try:
        # Download prerequisites
        try:
            download_prerequisites()
        except Exception as e:
            print(f"Error downloading prerequisites: {str(e)}")
            print("Continuing with available files...")
            success = False
        
        # Build components
        backend_success = True
        frontend_success = True
        db_success = True
        
        # Build backend
        try:
            build_backend()
        except Exception as e:
            print(f"Error building backend: {str(e)}")
            print("Continuing with installer build...")
            backend_success = False
            success = False
        
        # Build frontend
        try:
            build_frontend()
        except Exception as e:
            print(f"Error building frontend: {str(e)}")
            print("Continuing with installer build...")
            frontend_success = False
            success = False
        
        # Create database setup
        try:
            create_database_setup()
        except Exception as e:
            print(f"Error creating database setup: {str(e)}")
            print("Continuing with installer build...")
            db_success = False
            success = False
        
        # Create main launcher
        try:
            create_main_launcher()
        except Exception as e:
            print(f"Error creating main launcher: {str(e)}")
            print("Continuing with installer build...")
            success = False
        
        # Create installer script
        try:
            create_inno_setup_script()
        except Exception as e:
            print(f"Error creating Inno Setup script: {str(e)}")
            print("Installer build failed.")
            return 1
        
        # Build installer
        try:
            build_installer()
        except Exception as e:
            print(f"Error building installer: {str(e)}")
            print("Installer build failed.")
            return 1
        
        if not success:
            print("\nWarning: The installer was built with some components missing or incomplete.")
            if not backend_success:
                print("- Backend build failed")
            if not frontend_success:
                print("- Frontend build failed")
            if not db_success:
                print("- Database setup failed")
            print("The installer may not function correctly.")
        else:
            print("\nBuild completed successfully!")
        
    except Exception as e:
        print(f"Critical error: {e}")
        return 1
    
    return 0 if success else 2

if __name__ == "__main__":
    sys.exit(main()) 