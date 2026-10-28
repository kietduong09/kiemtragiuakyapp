# Sinh thu muc android/ va ios/ chuan cua React Native 0.76.9 roi cai dependency.
# Chay trong PowerShell, dung TRONG thu muc co package.json. Can Internet.
# (File nay chi dung ky tu ASCII de Windows PowerShell 5.1 doc dung.)
$ErrorActionPreference = "Stop"
if (-not (Test-Path package.json)) { throw "Hay chay script trong thu muc co package.json." }

npx @react-native-community/cli@latest init LibraryApp --version 0.76.9 --directory _tmp_native --skip-install --skip-git-init --pm npm
if ($LASTEXITCODE -ne 0) { throw "Khoi tao that bai (init)." }

if (-not (Test-Path android)) { Copy-Item _tmp_native\android -Destination android -Recurse }
if (-not (Test-Path ios))     { Copy-Item _tmp_native\ios     -Destination ios     -Recurse }
Remove-Item _tmp_native -Recurse -Force

# Dat ten hien thi tren launcher: "Quan ly thu vien" (viet bang ma Unicode)
$appName = [regex]::Unescape('Qu\u1EA3n l\u00FD th\u01B0 vi\u1EC7n')
$strings = Join-Path (Get-Location) "android\app\src\main\res\values\strings.xml"
$xml = [System.IO.File]::ReadAllText($strings)
$xml = $xml -replace '<string name="app_name">.*?</string>', "<string name=`"app_name`">$appName</string>"
[System.IO.File]::WriteAllText($strings, $xml, (New-Object System.Text.UTF8Encoding($false)))

npm install
if ($LASTEXITCODE -ne 0) { throw "npm install that bai." }
npx tsc --noEmit
Write-Host "XONG. Mo emulator roi chay: npx react-native run-android"
