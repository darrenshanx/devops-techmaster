## Docker CMD
### CMD và ENTRYPOINT

- **CMD**
    - Thực hiện lệnh mặc định khi run container từ image. 
    - CMD có thể bị ghi đè bằng biến thêm vào khi chạy lệnh run image.

- **ENTRYPOINT**
    - Gần giống CMD nhưng không thể ghi đè từ lệnh run image.
    - Khi run image với biến truyền vào thì biến truyền vào sẽ nối tiếp sau vào ENTRYPOINT.