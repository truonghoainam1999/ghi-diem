---
name: fix
description: Đi từ một lỗi được báo tới bản sửa — tái hiện, tìm gốc, chứng minh đã hết.
disable-model-invocation: true
---

# Sửa lỗi

## 1. Tái hiện trước

Nhìn thấy lỗi rồi mới được sửa. Dựng đúng cảnh lỗi theo `docs/kiem-chung.md` và **chụp lại làm ảnh "trước"** — bước 4 sẽ cần nó để so.

Dựng mãi không ra thì hỏi cho đúng chỗ, bằng `AskUserQuestion` với phương án cụ thể:

- lệch/sai **về hướng nào** — lên, xuống, trái, phải, thừa, thiếu
- **lúc nào** — ngay khi mở màn, khi chạm vào, sau khi bàn phím đóng, sau khi quay lại
- **lần nào** — ngay lần đầu, hay từ lần thứ hai trở đi
- **ở đâu** — máy ảo hay máy thật, bản debug hay Release

Ba câu này thường đủ để khoanh vùng. Đoán mò rồi sửa nhầm chỗ tốn nhiều lượt hơn hỏi một câu.

## 2. Tìm gốc, không vá triệu chứng

Đọc tới khi viết được một câu **"vì X nên Y"** — X là nguyên nhân, Y là đúng triệu chứng người dùng thấy. Chưa viết được câu đó thì chưa hiểu, đọc tiếp.

Nghi ngờ nằm ở nền tảng (React Native, expo-router, Hermes) thì mở thẳng `node_modules` đọc, hoặc dựng một probe nhỏ đo hành vi thật trên máy — nhanh hơn suy đoán, và cho ra bằng chứng.

## 3. Sửa nhỏ nhất chữa đúng X

Đụng đúng chỗ gây lỗi. Tiện tay dọn thứ khác thì để lần sau — bản sửa nhỏ mới soi được là nó chữa cái gì.

Chỗ nào dễ bị viết lại thành lỗi cũ thì để một comment nói **vì sao** phải làm vậy (`CLAUDE.md` mục "Bẫy đã cắn" là nơi ghi cái đáng nhớ lâu).

## 4. Chứng minh đã hết

Chụp/đo lại **đúng cảnh ở bước 1**, đặt cạnh ảnh trước. Đo được bằng số thì đo — lệch 5–6pt nhìn bằng mắt là đoán.

Chạy `npm run typecheck`.

Lỗi có nhiều đường tới (chưa kết thúc / đã kết thúc, người thứ nhất / người thứ tám) thì kiểm cả các đường còn lại — sửa hết một đường rồi báo xong là báo sai.

## 5. Dọn và báo

Xoá probe, ảnh tạm, dữ liệu thử; đưa app về màn chính.

Báo theo đúng thứ tự này: **gốc là gì** (câu "vì X nên Y"), **sửa gì**, **bằng chứng nào**, **còn gì chưa kiểm được**. Phần cuối đừng bỏ — thứ chưa bấm tay được thì nói thẳng là chưa bấm.

Thứ vừa học được mà phiên sau cũng cần biết (bẫy của nền tảng, quy ước mới, con số vừa đo) thì nhắc người dùng chạy `/update`.
