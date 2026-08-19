---
name: plan
description: Chốt plan cho một tính năng mới — hỏi cho rõ rồi viết ra plans/, chưa đụng vào code.
disable-model-invocation: true
---

# Plan một tính năng mới

Kết thúc skill này phải có một file plan mà người dùng đã chốt, và **không dòng code nào bị sửa**.

## 1. Đọc trước khi hỏi

Đọc `CLAUDE.md`, `README.md`, và những file tính năng này sẽ đụng tới — đọc thật, không suy từ tên file.

Xong khi kể được ba thứ: tính năng chạm vào file nào, dữ liệu đi qua đâu, và có phải thêm field vào `Game`/`Player` không.

Hỏi mà chưa đọc thì sẽ hỏi trúng thứ tự tìm được trong code — mất lượt của người dùng vào việc máy tự làm được.

## 2. Hỏi cho chốt

Dùng `AskUserQuestion`: mỗi lượt tối đa 4 câu, mỗi câu 2–4 phương án **cụ thể** (mô tả kết quả nhìn thấy được, không phải "làm kỹ" hay "làm nhanh"), phương án bạn khuyên đặt đầu tiên kèm "(nên chọn)". Chỗ nào so sánh được bằng hình thì đưa `preview` dạng phác khung.

Chỉ hỏi câu mà **hai đáp án khác nhau dẫn tới hai bản code khác nhau**. Câu nào đã có đáp án hiển nhiên thì tự quyết và ghi xuống mục Giả định — người dùng bác lại được, rẻ hơn một lượt hỏi.

Những trục hay phải quyết ở app này:

- **Đặt ở đâu** — màn nào, nhét vào menu `⋯` hay dựng nút riêng, thấy ngay hay phải nhấn giữ.
- **Dữ liệu cũ** — có thêm field vào `Game`/`Player` không, ván đã lưu đọc ra sẽ thế nào.
- **Ràng buộc đã chốt** — có đụng vào "5 người không cuộn ngang", màn hình dọc, hay chuyện chỉ lưu trong máy không.
- **Chữ hiển thị** — gọi thứ mới này là gì, có trùng nghĩa với từ đang dùng không.
- **Màu và token** — có cần màu mới không (cần thì phải qua `design/check-player-colors.mjs`).
- **Phạm vi** — bản tối thiểu chạy được, hay đủ bộ ngay từ đầu.

Đáp án nào mở ra câu hỏi mới thì hỏi tiếp lượt nữa, đừng đoán bừa cho xong.

## 3. Viết plan

Ghi vào `plans/<tên-gạch-ngang>.md`:

```md
# <tên tính năng>

## Mục tiêu
Một đoạn: xong rồi thì người dùng làm được gì mà giờ chưa làm được.

## Đã chốt
Từng câu đã hỏi → đáp án người dùng chọn.

## Giả định
Thứ bạn tự quyết. Người dùng đọc và bác được.

## Các bước
1. <việc> — sửa `<file>` — kiểm chứng: <chụp cảnh nào / chạy lệnh gì>
2. …

## Rủi ro
Chỗ dễ vỡ, và dấu hiệu nhận ra nó vỡ.

## Ngoài phạm vi
Thứ cố tình không làm lần này.
```

Mỗi bước phải nói rõ **sửa file nào** và **kiểm chứng thế nào** — bước nào không kiểm chứng được thì tách nhỏ ra tới khi kiểm được.

## 4. Đưa chốt

Tóm tắt plan cho người dùng trong tối đa 10 dòng: mục tiêu, các bước, giả định đang chờ họ bác. Hỏi có sửa gì không.

Chốt xong thì dừng — code là việc của `/cook`.
