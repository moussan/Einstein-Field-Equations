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
Source: "C:\Users\mouss\OneDrive\Documents\GitHub\Einstein-Field-Equations\build_installer\downloads\node-v18.16.1-x64.msi"; DestDir: "{tmp}"; Flags: deleteafterinstall
Source: "C:\Users\mouss\OneDrive\Documents\GitHub\Einstein-Field-Equations\build_installer\downloads\postgresql-14.5-1-windows-x64.exe"; DestDir: "{tmp}"; Flags: deleteafterinstall

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\Setup Database"; Filename: "{app}\database\setup_database.bat"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{commondesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
; Install Python
Filename: "{tmp}\python-3.9.13-amd64.exe"; Parameters: "/quiet InstallAllUsers=1 PrependPath=1"; StatusMsg: "Installing Python..."; Flags: runhidden shellexec; Check: FileExists('{tmp}\python-3.9.13-amd64.exe')

; Install Node.js
Filename: "msiexec.exe"; Parameters: "/i ""{tmp}\node-v18.16.1-x64.msi"" /quiet /norestart"; StatusMsg: "Installing Node.js..."; Flags: runhidden shellexec; Check: FileExists('{tmp}\node-v18.16.1-x64.msi')

; Install PostgreSQL
Filename: "{tmp}\postgresql-14.5-1-windows-x64.exe"; Parameters: "--unattendedmodeui minimal --mode unattended --superpassword postgres"; StatusMsg: "Installing PostgreSQL..."; Flags: runhidden shellexec; Check: FileExists('{tmp}\postgresql-14.5-1-windows-x64.exe')

; Setup Database
Filename: "{app}\database\setup_database.bat"; Description: "Setup Database"; Flags: postinstall runascurrentuser

; Launch application
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[Code]
function InitializeSetup(): Boolean;
begin
  Result := True;
  
  // Check if prerequisites exist
  if not FileExists(ExpandConstant('{tmp}\node-v18.16.1-x64.msi')) then
  begin
    MsgBox('Node.js installer not found or corrupted. The application will be installed but Node.js will not be installed automatically.', mbInformation, MB_OK);
  end;
  
  if not FileExists(ExpandConstant('{tmp}\postgresql-14.5-1-windows-x64.exe')) then
  begin
    MsgBox('PostgreSQL installer not found or corrupted. The application will be installed but PostgreSQL will not be installed automatically.', mbInformation, MB_OK);
  end;
  
  if not FileExists(ExpandConstant('{tmp}\python-3.9.13-amd64.exe')) then
  begin
    MsgBox('Python installer not found or corrupted. The application will be installed but Python will not be installed automatically.', mbInformation, MB_OK);
  end;
end;
