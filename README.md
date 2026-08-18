# Ghi Điểm

App ghi điểm cho ván bài và boardgame chơi tại bàn. Expo + React Native, StyleSheet thuần, không dùng thư viện UI.

```bash
npm start          # mở Metro, quét QR bằng Expo Go
npm run ios        # chạy trên máy ảo iOS
npm run typecheck  # kiểm tra kiểu
```

## Ràng buộc đã chốt

- Không giới hạn số người chơi, nhưng **5 người phải vừa màn 390pt mà không cuộn ngang**. Sàn 44pt mỗi cột nên tới 8 người vẫn vừa; từ 9 người mới cuộn, và khi đó cột "Vòng" ghim lại bên trái.
- **Khoá màn hình dọc** — không dựng bố cục ngang.
- Nhập điểm **theo số**, không theo thứ hạng.
- Dữ liệu **chỉ lưu trong máy**: không tài khoản, không backend, không mạng.
- Chưa làm thống kê dài hạn, nhưng dữ liệu lưu đủ để thêm sau mà không phải migrate.

## Cấu trúc

```
app/                        Định tuyến (expo-router: mỗi file là một màn hình)
  _layout.tsx               Stack + ThemeProvider + GamesProvider
  index.tsx                 Danh sách ván
  new.tsx                   Tạo ván mới (mở dạng modal)
  game/[id]/index.tsx       Bảng điểm — màn nhìn nhiều nhất
  game/[id]/result.tsx      Kết quả: bục xếp hạng + biểu đồ

src/
  domain/                   Logic thuần — không import React, test được thẳng
    types.ts                Game, Player, Round, Standing
    scoring.ts              Tổng, xếp hạng, xu hướng, điểm cộng dồn
    zeroSum.ts              Luật tổng mỗi vòng bằng 0
    layout.ts               Bề rộng cột, cỡ chữ theo số người, định dạng số
    text.ts                 Cắt emoji theo cụm ký tự
    id.ts

  storage/                  Lưu trong máy, qua AsyncStorage
    gamesRepository.ts      Đọc/ghi danh sách ván
    GamesProvider.tsx       Context + mọi hành động sửa dữ liệu
    themeRepository.ts      Lựa chọn giao diện sáng/tối

  theme/
    tokens.ts               Màu, chữ, khoảng cách — nguồn sự thật duy nhất
    ThemeProvider.tsx       useTheme(), useThemeMode(), makeStyles()

  components/
    ui/                     Nguyên thuỷ, không biết gì về nghiệp vụ
    game/                   Component theo nghiệp vụ, ghép từ ui/
```

Quy tắc phụ thuộc, không được đi ngược chiều:

```
app/ → components/game/ → components/ui/ → theme/
                ↓
            domain/ ← storage/
```

## Quy ước

- **Không dùng `<Text>` gốc của React Native** — dùng `components/ui/Text` để không có cỡ chữ hay màu nào lọt ra ngoài hệ token.
- **Không viết hex trực tiếp** trong component. Màu lấy từ `useTheme()`.
- Style viết bằng `makeStyles((t) => ({ … }))` để đổi ngày/đêm là tự tính lại.
- Mọi chỗ hiện số phải có `fontVariant: ['tabular-nums']` và dùng `formatScore()` — dấu trừ U+2212 rộng bằng chữ số nên cột mới thẳng.
- Vùng chạm tối thiểu 44×44 (`HIT` trong tokens).
- **Màu chỉ thuộc về người chơi.** Nút, thẻ, nền, logo đều là mực và giấy. Màu ngữ nghĩa (`danger`, `trend`, `medal`) là ngoại lệ có chủ đích, tách riêng khỏi `playerColors`.
- Mọi bottom sheet dựng trên `ui/Sheet` — nó lo nền mờ, bo góc và phần tính chỗ cho bàn phím.

## Màu đã được kiểm chứng, đừng chỉnh bằng mắt

Bảng màu người chơi và ba bậc chữ đều đo bằng công cụ, không chọn bằng cảm giác:

- **8 màu người chơi**: thứ tự được dò để hai màu cạnh nhau cách xa nhất dưới mắt mù màu. ΔE 11.7 (ngày) / 9.4 (đêm), ngưỡng 8.
- **Ba bậc chữ**, đo trên nền khó đọc nhất: ngày 13.7 / 7.0 / 4.7 — đêm 13.1 / 9.6 / 7.0. Bản đêm cao hơn vì chữ sáng trên nền tối trông mảnh hơn ở cùng tỉ số.
- **Đường kẻ**: `line` ~2.2:1 cho viền thẻ, `line2` ~3:1 cho viền ô nhập và chip.

Đổi màu nào thì chạy lại trình kiểm tra trước khi ship. Lý do từng con số ghi trong `src/theme/tokens.ts`.

## Thiết kế và logo

```
design/mockup-v1.html      Bản màu 5 màn hình × 2 giao diện
design/wireframe-v1.html   Bản khung, giữ để đối chiếu
design/logo.html           6 phương án logo, đã chọn phương án 02
design/logo/mark.svg       Logo gốc dạng vector
design/shots.mjs           Xuất PNG cho mockup
design/make-icons.mjs      Xuất bộ icon vào assets/
```

Sửa logo thì sửa `design/make-icons.mjs` rồi chạy `node design/make-icons.mjs` — cả sáu file icon sinh lại từ một nguồn.

Sửa token màu thì sửa `src/theme/tokens.ts` và cập nhật `design/mockup-v1.html` cho khớp.
# ghi-diem
