# LibraryApp – Quản lý thư viện (React Native CLI + TypeScript)

Ứng dụng dành cho thủ thư: quản lý sách, thêm/sửa/xóa, xem chi tiết, cho mượn/nhận trả, tìm kiếm + lọc thể loại, lưu dữ liệu cục bộ bằng AsyncStorage. Không dùng Expo, không dùng thư viện UI dựng sẵn, không dùng vector-icons.

## LƯU Ý QUAN TRỌNG VỀ GÓI NÀY

Gói có đầy đủ source (`src/`, `App.tsx`, `index.js`) và các file cấu hình (`package.json`, `tsconfig.json`, `babel.config.js`, `metro.config.js`, `app.json`...) theo đúng template React Native 0.76.9. Riêng thư mục **`android/`** (và `ios/`) chưa có, vì môi trường tạo gói không có Internet để chạy React Native CLI. Chạy `add-native` (bên dưới) một lần để sinh chúng.

## Yêu cầu môi trường

- Node.js >= 18, npm
- JDK 17 (khuyến nghị; JDK 21 có thể gây lỗi Gradle với RN 0.76)
- Android Studio + Android SDK (Platform 35, Build-Tools 35), emulator hoặc điện thoại bật USB debugging
- Biến môi trường `ANDROID_HOME` trỏ tới Android SDK, và `platform-tools` nằm trong PATH
- React Native **0.76.9** (React Native CLI, không Expo)

## Cài đặt

Giải nén, mở terminal **trong thư mục `LibraryApp`** (thấy `package.json`):

```powershell
# Windows PowerShell
powershell -ExecutionPolicy Bypass -File .\add-native.ps1
```
```bash
# macOS / Linux
bash add-native.sh
```

Script sẽ: sinh `android/` + `ios/` chuẩn của RN 0.76.9 (không ghi đè code của bạn) → đặt tên launcher "Quản lý thư viện" → `npm install` → `tsc --noEmit`.

### Cài thủ công (nếu script lỗi)

```bash
# đứng trong thư mục LibraryApp
npx @react-native-community/cli@latest init LibraryApp --version 0.76.9 --directory _tmp_native --skip-install --skip-git-init
# chép _tmp_native/android và _tmp_native/ios vào thư mục LibraryApp hiện tại, rồi xóa _tmp_native
npm install
npx tsc --noEmit
```
Phải dùng đúng tên `LibraryApp` khi init, vì `android/` chứa package `com.libraryapp` và tên component `LibraryApp` phải khớp với `app.json`.

## Chạy ứng dụng

```bash
npx react-native start          # terminal 1: Metro
npx react-native run-android    # terminal 2 (đã bật emulator / cắm điện thoại)
```

Kiểm tra thiết bị: `adb devices`.

## Xử lý lỗi thường gặp

| Lỗi | Cách xử lý |
|---|---|
| `SDK location not found` | Tạo `android/local.properties` với dòng `sdk.dir=C\:\\Users\\TEN\\AppData\\Local\\Android\\Sdk` (Windows) hoặc `sdk.dir=/Users/TEN/Library/Android/sdk` (macOS); hoặc đặt biến `ANDROID_HOME`. |
| `adb` / `no connected devices` | Mở emulator từ Android Studio, hoặc bật USB debugging; kiểm tra `adb devices`. |
| Gradle / `Unsupported class file major version` | Dùng JDK 17, đặt `JAVA_HOME` tương ứng, rồi `cd android && gradlew clean`. |
| Metro cache lỗi | `npx react-native start --reset-cache` |
| Lỗi native module (AsyncStorage/screens) sau khi cài thêm package | Dừng Metro, chạy lại `npx react-native run-android` để build lại bản native. |
| Bàn phím che ô nhập trên Android 15 | Form đã tự chừa khoảng cuộn bằng chiều cao bàn phím; nếu ô bị che hãy cuộn nhẹ form. |

## Cấu trúc

```
src/
├── components/  BookCard, SearchBar, CategoryFilter, BookFormField, EmptyState, PrimaryButton, Toast
├── screens/     BookListScreen, BookFormScreen (thêm + sửa), BookDetailScreen
├── navigation/  AppNavigator (native stack)
├── services/    bookStorage (AsyncStorage, kiểm tra JSON)
├── hooks/       useBooks (Context + hàng đợi ghi tuần tự)
├── utils/       bookOperations (nghiệp vụ thuần), validation (xác thực form)
├── types/       book, navigation
├── constants/   initialBooks (6 sách mẫu)
└── theme/       colors, spacing, typography
```

Điểm thiết kế để giải thích với giảng viên:
- **Một nguồn dữ liệu duy nhất**: `BooksProvider` (Context) – mọi màn hình đọc cùng một state; màn hình Chi tiết/Form chỉ nhận `bookId` rồi tra cứu sách mới nhất nên không bao giờ lỗi thời.
- **Chống race condition**: mọi thao tác ghi đi qua một hàng đợi Promise tuần tự, tính từ `booksRef` (dữ liệu mới nhất), **lưu AsyncStorage thành công rồi mới cập nhật state**. Nhấn "Cho mượn" nhiều lần liên tiếp vẫn đúng và không vượt quá số lượng.
- **Nghiệp vụ là hàm thuần** (`bookOperations.ts`) nên kiểm thử được độc lập; điều kiện mượn/trả/xóa/sửa được kiểm tra lại trong hàm chứ không chỉ dựa vào nút disabled.
- **Khởi động**: màn hình loading cho đến khi đọc xong AsyncStorage. Chỉ seed dữ liệu mẫu khi chưa có khóa lưu (lần đầu). Lỗi đọc → màn hình lỗi + nút "Thử lại", **không ghi đè dữ liệu cũ**. JSON hỏng → sao lưu bản hỏng sang khóa `@LibraryApp/books_corrupt_backup` rồi khôi phục dữ liệu mẫu.

## Cách dùng

1. **Danh sách**: xem thống kê (đầu sách, tổng số cuốn đang mượn) ở đầu màn hình; tìm kiếm theo tên/tác giả; chọn thể loại (kết hợp được với tìm kiếm); nút × để xóa từ khóa.
2. **Thêm**: nhấn "+ Thêm sách" → nhập form → "Lưu sách".
3. **Sửa**: mở Chi tiết → "Sửa thông tin sách" (form tự điền; không đổi `id`, giữ nguyên `borrowed`).
4. **Mượn/Trả**: trong Chi tiết nhấn "Cho mượn" / "Nhận trả" (nút bị vô hiệu khi không hợp lệ).
5. **Xóa**: nhấn giữ một dòng sách → xác nhận. Sách đang có người mượn sẽ bị chặn kèm giải thích.

## Kiểm tra dữ liệu được lưu

Thêm/sửa một sách → đóng hẳn app (vuốt khỏi đa nhiệm) → mở lại: dữ liệu còn nguyên. Để thử lần chạy đầu: gỡ cài đặt app hoặc "Clear storage" trong Cài đặt Android.

## Kiểm thử ĐÃ thực sự chạy (trong môi trường tạo gói)

Chạy bằng Node + tsx với AsyncStorage giả lập trong bộ nhớ – **29/29 test đạt**:
- Xác thực: tên/tác giả rỗng, năm không phải số/thập phân/`1e3`, năm < 1900, năm > hiện tại, biên 1900 và năm hiện tại, số lượng 0/âm/chữ/thập phân/quá lớn, `quantity < borrowed`, tên quá dài.
- Nghiệp vụ: thống kê (tổng `borrowed`), thêm (id duy nhất, borrowed=0), sửa (giữ id và borrowed, không mutate), xóa (chặn khi borrowed>0), mượn (chặn khi hết), trả (chặn khi borrowed=0), mượn/trả liên tiếp 10 lần không vượt biên.
- Tìm kiếm/lọc: theo tên, tác giả, hoa/thường, chuỗi rỗng/khoảng trắng, kết hợp với thể loại, không có kết quả.
- Lưu trữ: lần đầu seed 6 sách; không seed lại khi đã có dữ liệu (kể cả danh sách rỗng); JSON hỏng; bản ghi sai; lỗi đọc không ghi đè; lỗi ghi ném lỗi.
- `tsc --strict` cho các file logic/lưu trữ: không lỗi kiểu (chỉ báo thiếu `console` do môi trường kiểm tra không có type RN). Kiểm tra cú pháp toàn bộ file TSX và kiểm tra mọi import tương đối đều tồn tại: đạt.

## CHƯA kiểm tra được (cần bạn làm trên máy có Android)

- `react-native init`, `npm install`, `tsc --noEmit` trên project đầy đủ (cần Internet + type của React Native).
- Build Android, chạy trên emulator/thiết bị, giao diện thực tế, bàn phím, hành vi Alert/nhấn giữ.
- Hàng đợi ghi trong `useBooks` (đã đọc lại logic, chưa chạy test tự động).
- Version thư viện đã chọn theo RN 0.76; nếu `npm install` báo xung đột peer dependency, báo lại lỗi để chỉnh version.

Hãy chạy thử ít nhất danh sách 30 tình huống trong đề trước khi nộp.

## Tạo file ZIP nộp bài

Từ thư mục `LibraryApp` đã chạy được, **loại** `node_modules`, `android/build`, `android/app/build`, `ios/Pods`:

```powershell
# Windows PowerShell (trong thư mục cha của LibraryApp)
Get-ChildItem LibraryApp -Force | Where-Object { $_.Name -ne 'node_modules' } |
  Compress-Archive -DestinationPath HoTen_MSSV_De1.zip -Force
Remove-Item -Recurse -Force LibraryApp\android\build, LibraryApp\android\app\build -ErrorAction SilentlyContinue  # nếu có
```
Cách đơn giản hơn: chuột phải thư mục → xóa tạm `node_modules`, `android/build`, `android/app/build` rồi nén. Đổi tên theo mẫu `HoTen_MSSV_De1.zip`.
