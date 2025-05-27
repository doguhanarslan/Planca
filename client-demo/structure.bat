@echo off
echo Creating FSD folder structure...

REM Ana klasörler
for %%d in (app pages widgets features entities shared) do mkdir src\%%d 2>nul

REM App alt klasörleri
for %%d in (providers store styles) do mkdir src\app\%%d 2>nul

REM Pages alt klasörleri
for %%d in (home auth appointments customers services employees dashboard) do (
    mkdir src\pages\%%d\ui 2>nul
)
mkdir src\pages\appointments\model 2>nul

REM Widgets alt klasörleri
mkdir src\widgets\layout\ui 2>nul
mkdir src\widgets\appointment-calendar\ui 2>nul
mkdir src\widgets\appointment-calendar\model 2>nul
mkdir src\widgets\customer-list\ui 2>nul
mkdir src\widgets\customer-list\model 2>nul
mkdir src\widgets\dashboard-stats\ui 2>nul

REM Features alt klasörleri
mkdir src\features\auth\login\ui 2>nul
mkdir src\features\auth\login\model 2>nul
mkdir src\features\auth\register\ui 2>nul
mkdir src\features\auth\register\model 2>nul
mkdir src\features\auth\logout\ui 2>nul
mkdir src\features\appointment\create-appointment\ui 2>nul
mkdir src\features\appointment\create-appointment\model 2>nul
mkdir src\features\appointment\edit-appointment\ui 2>nul
mkdir src\features\appointment\cancel-appointment\ui 2>nul

REM Customer, Service, Employee features
for %%f in (customer service employee) do (
    for %%a in (create edit delete) do (
        mkdir src\features\%%f\%%a-%%f 2>nul
    )
)
mkdir src\features\employee\manage-schedule 2>nul

REM Entities alt klasörleri
for %%e in (appointment customer service employee user) do (
    mkdir src\entities\%%e\ui 2>nul
    mkdir src\entities\%%e\model 2>nul
    mkdir src\entities\%%e\api 2>nul
)

REM Shared alt klasörleri
for %%u in (button input card modal alert) do mkdir src\shared\ui\%%u 2>nul
mkdir src\shared\api\base 2>nul
mkdir src\shared\lib\utils 2>nul
mkdir src\shared\config 2>nul
mkdir src\shared\types 2>nul

echo Folder structure created successfully!
pause