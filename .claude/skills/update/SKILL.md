---
name: update
description: Cập nhật tài liệu theo những gì vừa đổi — thêm thứ đáng nhớ, xoá thứ đã sai.
disable-model-invocation: true
---

# Cập nhật tài liệu

Tài liệu hỏng theo kiểu bồi lắng: ai cũng thấy thêm một dòng là an toàn, xoá một dòng là rủi ro, nên nó dày lên bằng những câu đã sai. Skill này sửa cả hai chiều — thêm thứ mới **và** xoá thứ hết đúng.

## 1. Xem đã đổi gì

`git status` và `git diff` (cả phần chưa commit lẫn vài commit gần nhất), cộng với việc vừa làm trong phiên này.

Xong khi liệt kê được: file nào đổi, và **thứ gì trong đó là tri thức** chứ không phải chi tiết một lần.

## 2. Lọc: thứ gì đáng vào tài liệu

Chỉ ghi thứ mà phiên sau **đọc code cũng không tự tìm ra**: lý do đằng sau một lựa chọn, cái bẫy của nền tảng, quy ước không nằm ở đâu cả, con số đã đo được.

Bỏ qua: thứ code tự nói (tên hàm, luồng gọi), thứ `package.json` và cấu trúc thư mục đã nói, và chi tiết chỉ đúng cho lần sửa này. Ghi vào cũng thành rác sau vài tuần.

## 3. Ghi đúng chỗ

Mỗi tài liệu có một việc; ghi lẫn chỗ là lần sau sửa một nơi quên nơi kia.

| Thứ vừa đổi | Ghi vào |
|---|---|
| cấu trúc thư mục, quy tắc phụ thuộc, quy ước code, ràng buộc sản phẩm, bảng màu | `README.md` |
| bẫy của React Native / expo-router / Hermes, luật khi viết code mới, bar kiểm chứng | `CLAUDE.md` |
| cách dựng cảnh để soi, lệnh chạy máy ảo và máy thật | `docs/kiem-chung.md` |
| tiến độ và chỗ lệch của một tính năng đang làm | `plans/<tính-năng>.md` |
| lý do chỉ đúng cho một đoạn code | comment ngay tại chỗ đó |

`CLAUDE.md` nạp lại mỗi lượt nói chuyện, nên mỗi dòng thêm vào đó đều tính tiền. Chi tiết dài thì đẩy sang `docs/` và để lại một dòng trỏ tới.

## 4. Xoá thứ đã sai

Đi ngược lại: mọi **tên file, lệnh, con số** mà tài liệu đang nhắc tới đều phải kiểm lại là còn đúng — `ls` cái tên đó, chạy cái lệnh đó, đối chiếu con số đó với code.

Sai thì sửa. Không còn tồn tại thì xoá hẳn dòng, đừng để lại kèm ghi chú "cũ". Một điều nói ở hai chỗ thì giữ chỗ đúng vai (bảng ở mục 3), chỗ kia xoá.

Xong khi không còn dòng nào chưa được đối chiếu.

## 5. Báo

Từng file: thêm gì, xoá gì, vì sao. Kèm danh sách thứ đã cân nhắc mà **cố tình không ghi** — để người dùng bác lại nếu họ thấy đáng ghi.
