# Kiểm chứng bằng mắt

Máy này **không tự bấm hay gõ vào máy ảo được** — `osascript` chưa được cấp quyền Accessibility, và không có `idb` hay `cliclick`. Nên không đợi chạm được vào màn hình: dựng thẳng trạng thái cần soi bằng một route tạm rồi mở nó bằng deep link.

## Route tạm

Viết `app/probe.tsx` dựng đúng cảnh cần xem, rồi:

```bash
xcrun simctl openurl booted "tinhdiem://probe"      # scheme khai trong app.json
xcrun simctl io booted screenshot ~/Documents/Documents/Company/tinh_diem/.probe.png
```

Ảnh phải ghi vào thư mục trong `~/Documents`; ghi vào `/private/tmp/...` bị chặn ("read-only file system") kể cả khi tắt sandbox.

Mấy mẹo dựng cảnh:

- **Trạng thái sau vài thao tác**: `setTimeout` gọi `router.push` / `router.dismissTo` theo chuỗi. Màn nằm dưới trong ngăn xếp vẫn sống, nên probe đặt ở dưới cùng có thể vừa lái vừa ghi lại diễn biến.
- **Bàn phím đang mở**: thêm tạm `autoFocus` vào `TextInput` cần soi.
- **Sheet đang mở**: đổi tạm `useState(false)` thành `useState(true)`.
- **Cần dữ liệu**: `useGames()` — nhưng phải đợi `ready` mới tạo ván, không thì bản nạp từ ổ đĩa ập về đè mất ván vừa tạo.
- **Chọn cảnh bằng tham số**: `tinhdiem://probe?which=off` rồi đọc bằng `useLocalSearchParams` — đỡ phải sửa file giữa hai lần chụp.

## Ăn phải ảnh cũ

Fast refresh giữ nguyên state của màn đang mở, nên sửa probe rồi chụp lại rất dễ ra ảnh của lần trước. Muốn chắc:

```bash
xcrun simctl terminate booted com.tinhdiem.app && xcrun simctl openurl booted "tinhdiem://probe"
```

Và đặt sẵn một mốc nhận dạng trong probe (tên khác đi, nhãn khác đi) để biết ảnh có đúng bản vừa sửa không.

## Đo thay vì ước lượng

Lệch 5–6pt nhìn bằng mắt trên ảnh chụp là đoán. Máy không có PIL; đọc PNG bằng `zlib` rồi tự bỏ filter là đủ để đo — tìm biên khung bằng cách đếm pixel sáng theo hàng, rồi so tâm chữ với tâm khung.

## Dọn

Xoá `app/probe.tsx`, xoá ảnh tạm, xoá ván thử vừa dựng (một probe khác quét `games` theo `title` rồi `deleteGame`), rồi `xcrun simctl openurl booted "tinhdiem://"` để app về màn chính.

## Chạy trên máy thật

```bash
xcrun devicectl list devices                                    # tìm máy đang cắm
npx expo run:ios --device <udid>                                # bản debug, JS lấy từ Metro qua Wi-Fi
npx expo run:ios --device <udid> --configuration Release        # bundle nhét vào app, rút cáp vẫn chạy
```

Bản debug ghi IP của Mac vào `ip.txt` trong app bundle — điện thoại phải cùng Wi-Fi. Bản Release thì không, nhưng cũng không có fast refresh.

Máy ảo và máy thật dùng chung bundle id nên **không** dùng chung dữ liệu — mỗi máy một kho riêng.
