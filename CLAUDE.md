# Ghi Điểm

`README.md` là nguồn sự thật về cấu trúc thư mục, quy tắc phụ thuộc, quy ước code và ràng buộc sản phẩm — đọc nó trước khi sửa. File này chỉ nói phần README không nói: chạy, kiểm chứng, và mấy cái bẫy đã cắn rồi.

## Kiểm chứng — dự án không có test, nên phải nhìn tận mắt

Sửa xong chạy `npm run typecheck`.

Đụng tới giao diện hoặc luồng màn hình thì **chụp lại app đang chạy mà xem**, đừng suy từ code — nhiều lỗi ở đây (chữ lệch trong ô, màn hình chồng nhau) chỉ lộ ra khi nhìn. Máy này không tự bấm hay gõ vào máy ảo được; cách dựng đúng trạng thái cần soi, kể cả trạng thái chỉ tới được sau vài thao tác, nằm ở `docs/kiem-chung.md`.

Báo lại bằng thứ đo được — ảnh chụp, số đo, log. Chỗ nào chưa kiểm được thì nói thẳng là chưa kiểm.

## Bẫy đã cắn

- **Quay lại màn đã mở**: dùng `router.dismissTo(...)`. `router.replace` chỉ thay màn trên cùng nên màn cũ đọng lại phía dưới, back một cái là thấy màn hình lặp lại chính nó.
- **Thêm field vào `Game`/`Player`**: để optional và đọc được cả ván cũ (`showTotals?: boolean` là tiền lệ). Dữ liệu nằm trong máy người dùng, không có bước migrate. Đổi thứ tự `playerColors` cũng là đổi màu của mọi ván đã lưu.
- **`Intl` trên Hermes**: thiếu nhiều thứ, không có `Segmenter`. Dùng gì thuộc `Intl` thì chạy thử trên máy trước — nhánh dự phòng im lặng chạy sai còn tệ hơn lỗi.
- **`TextInput` của iOS**: lúc focus nó vẽ chữ theo line-height của font hệ thống, emoji đặt trong đó sẽ lệch. Muốn căn chuẩn thì hiện bằng `<Text>` và để `TextInput` trong suốt phủ lên (xem `PlayerAppearanceSheet`).
- **Đổi màu người chơi**: `node design/check-player-colors.mjs`, sàn không được tụt so với trước.

## Tiếng Việt

Chữ hiển thị và comment đều tiếng Việt. Comment nói **vì sao** mới viết, không nói lại code đang làm gì.
