#!/usr/bin/env bash
# macOS/Linux: đứng TRONG thư mục LibraryApp rồi chạy: bash add-native.sh
set -e
[ -f package.json ] || { echo "Hãy chạy trong thư mục LibraryApp"; exit 1; }
npx @react-native-community/cli@latest init LibraryApp --version 0.76.9 --directory _tmp_native --skip-install --skip-git-init --pm npm
[ -d android ] || cp -R _tmp_native/android android
[ -d ios ] || cp -R _tmp_native/ios ios
rm -rf _tmp_native
sed -i.bak 's#<string name="app_name">.*</string>#<string name="app_name">Quản lý thư viện</string>#' android/app/src/main/res/values/strings.xml && rm -f android/app/src/main/res/values/strings.xml.bak
npm install
npx tsc --noEmit
echo "Xong. Mở emulator rồi chạy: npx react-native run-android"
