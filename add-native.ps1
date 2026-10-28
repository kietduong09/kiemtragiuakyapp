# Sinh thư mục android/ và ios/ chuẩn của React Native 0.76.9 rồi cài dependency.
# Chạy trong PowerShell, đứng TRONG thư mục LibraryApp (nơi có package.json). Cần Internet.
$ErrorActionPreference = "Stop"
if (-not (Test-Path package.json)) { throw "Hãy chạy script trong thư mục LibraryApp (có package.json)." }

npx @react-native-community/cli@latest init LibraryApp --version 0.76.9 --directory _tmp_native --skip-install --skip-git-init --pm npm
if (-not (Test-Path android)) { Copy-Item _tmp_native\android -Destination android -Recurse }
if (-not (Test-Path ios))     { Copy-Item _tmp_native\ios     -Destination ios     -Recurse }
Remove-Item _tmp_native -Recurse -Force

# Tên hiển thị trên launcher
$strings = "android\app\src\main\res\values\strings.xml"
(Get-Content $strings -Raw -Encoding UTF8) -replace '<string name="app_name">.*?</string>', '<string name="app_name">Quản lý thư viện</string>' | Set-Content $strings -Encoding UTF8

npm install
npx tsc --noEmit
Write-Host "Xong. Mở emulator rồi chạy:  npx react-native run-android"
