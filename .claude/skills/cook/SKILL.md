---
name: cook
description: Làm theo một plan trong plans/ — từng bước, kiểm chứng từng bước, cập nhật lại plan.
disable-model-invocation: true
---

# Làm theo plan

## 1. Đọc plan

Lấy file plan theo tên người dùng đưa; không đưa thì lấy file mới nhất trong `plans/`, và nói rõ đang làm plan nào trước khi bắt tay.

Đọc luôn `CLAUDE.md` và những file plan bảo sẽ sửa.

Plan mâu thuẫn với code hiện tại (file đã đổi, bước đã có người làm) thì dừng, nói ra chỗ lệch, hỏi trước khi làm tiếp.

## 2. Làm từng bước

Theo đúng thứ tự trong plan. Sau **mỗi** bước:

- `npm run typecheck`
- chạy đúng phần kiểm chứng mà bước đó ghi — đụng giao diện thì chụp màn hình xem (`docs/kiem-chung.md`), đừng suy từ code.

Bước nào chưa kiểm chứng xong thì chưa được coi là xong.

## 3. Gặp thứ plan chưa tính tới

Chi tiết nhỏ (đặt tên biến, tách hàm) thì tự quyết rồi ghi lại.

Thứ làm đổi hướng — bước không làm được như plan viết, phát hiện ràng buộc mới, phải sửa thêm file ngoài danh sách — thì **dừng, nói ra, hỏi**. Làm tiếp theo hướng khác mà không hỏi là biến plan đã chốt thành plan không ai chốt.

## 4. Cập nhật plan

Đánh dấu bước đã xong ngay trong file plan, kèm một dòng bằng chứng (ảnh nào, lệnh nào). Chỗ nào làm khác plan thì ghi làm khác chỗ nào và vì sao.

## 5. Dọn và báo

Xoá file tạm đã dựng để kiểm chứng (`app/probe.tsx`, ảnh chụp, ván thử trong máy ảo), đưa app về màn chính, chạy `npm run typecheck` lần cuối.

Báo lại: bước nào xong kèm bằng chứng, bước nào chưa và vướng chỗ nào, thứ gì đổi khác plan. Chưa xong hết thì nói thẳng còn bước nào — đừng gói lại như đã xong.

Thứ vừa học được mà phiên sau cũng cần biết (bẫy của nền tảng, quy ước mới, con số vừa đo) thì nhắc người dùng chạy `/update`.
