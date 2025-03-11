#define MyAppName "Einstein Field Equations Platform"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Einstein Field Equations Team"
#define MyAppURL "https://github.com/yourusername/Einstein-Field-Equations"
#define MyAppExeName "Einstein_Field_Equations.bat"

[Setup]
AppId={{8A7D8AE1-9F0D-4B8B-B154-A1D7F7E5E1E9}}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
LicenseFile=C:\Users\mouss\OneDrive\Documents\GitHub\Einstein-Field-Equations\LICENSE
OutputDir=C:\Users\mouss\OneDrive\Documents\GitHub\Einstein-Field-Equations\dist
OutputBaseFilename=Einstein_Field_Equations_Setup
Compression=lzma
SolidCompression=yes
WizardStyle=modern
SetupIconFile=C:\Users\mouss\OneDrive\Documents\GitHub\Einstein-Field-Equations\build_installer\app_icon.ico
UninstallDisplayIcon={app}\app_icon.ico

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
; Main application files
Source: "C:\Users\mouss\OneDrive\Documents\GitHub\Einstein-Field-Equations\build_installer\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

; Prerequisites
Source: "C:\Users\mouss\OneDrive\Documents\GitHub\Einstein-Field-Equations\build_installer\downloads\python-3.9.13-amd64.exe"; DestDir: "{tmp}"; Flags: deleteafterinstall
Source: "C:\Users\mouss\OneDrive\Documents\GitHub\Einstein-Field-Equations\build_installer\downloads\node-v16.15.1-x64.msi"; DestDir: "{tmp}"; Flags: deleteafterinstall
Source: "C:\Users\mouss\OneDrive\Documents\GitHub\Einstein-Field-Equations\build_installer\downloads\postgresql-14.5-1-windows-x64.exe"; DestDir: "{tmp}"; Flags: deleteafterinstall

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\Setup Database"; Filename: "{app}\database\setup_database.bat"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{commondesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
; Install Python
Filename: "{tmp}\python-3.9.13-amd64.exe"; Parameters: "/quiet InstallAllUsers=1 PrependPath=1"; StatusMsg: "Installing Python..."; Flags: runhidden

; Install Node.js
Filename: "{tmp}\node-v16.15.1-x64.msi"; Parameters: "/quiet /norestart"; StatusMsg: "Installing Node.js..."; Flags: runhidden

; Install PostgreSQL
Filename: "{tmp}\postgresql-14.5-1-windows-x64.exe"; Parameters: "--unattendedmodeui minimal --mode unattended --superpassword postgres"; StatusMsg: "Installing PostgreSQL..."; Flags: runhidden

; Setup Database
Filename: "{app}\database\setup_database.bat"; Description: "Setup Database"; Flags: postinstall runascurrentuser

; Launch application
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent
