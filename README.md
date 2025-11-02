# 🚖 UIT-Go – Cloud-Native Ride Hailing Platform

UIT-Go là đồ án mô phỏng hệ thống gọi xe (Grab/Uber) được thiết kế theo kiến trúc **microservices** gồm:

- 🧍 **UserService** — Quản lý người dùng (đăng ký, đăng nhập, profile)
- 🚕 **TripService** — Xử lý chuyến đi (đặt xe, hủy, hoàn thành, đánh giá)
- 🚗 **DriverService** — Quản lý tài xế, vị trí thời gian thực, và phản hồi chuyến
- 🗺 **Redis** — Lưu toạ độ geospatial của tài xế
- 🗄 **PostgreSQL** — CSDL riêng cho từng service

---

## ⚙️ 1. Yêu cầu môi trường

- Docker ≥ 24.x  
- Docker Compose ≥ 2.x  
- Cổng trống: 8081, 8082, 8083, 5433–5435, 6379  

---

## 📁 2. Cấu trúc thư mục

```
uit-go/
 ├── docker-compose.yml
 ├── user-service/
 │   ├── src/
 │   ├── Dockerfile
 │   └── .env
 ├── driver-service/
 │   ├── src/
 │   ├── Dockerfile
 │   └── .env
 ├── trip-service/
 │   ├── src/
 │   ├── Dockerfile
 │   └── .env
 └── README.md
```

---

## 🐳 3. Chạy toàn bộ hệ thống bằng Docker Compose

Tại thư mục gốc:

```bash
docker compose up --build
```

Docker sẽ tự động:
- Tạo 3 container PostgreSQL (user-db, trip-db, driver-db)
- Khởi chạy Redis (driver-redis)
- Build & chạy 3 service Node.js:
  - `user-service` → http://localhost:8081
  - `driver-service` → http://localhost:8082
  - `trip-service` → http://localhost:8083

Khi thấy log:

```
✅ [user-service] users table ready
🚕 TripService running on port 8083
🚗 DriverService running on port 8082
✅ Redis connection ready
```

→ hệ thống đã sẵn sàng.

---

## 🌐 4. API Endpoints

### 🧍 User Service (http://localhost:8081/api)
| Method | Endpoint | Mô tả |
|--------|-----------|-------|
| POST | `/users` | Đăng ký tài khoản |
| POST | `/sessions` | Đăng nhập (nhận JWT) |
| GET | `/users/me` | Lấy thông tin cá nhân |

---

### 🚕 Trip Service (http://localhost:8083/api)
| Method | Endpoint | Mô tả |
|--------|-----------|-------|
| POST | `/trips` | Tạo chuyến đi mới |
| POST | `/trips/:id/cancel` | Hủy chuyến |
| POST | `/trips/:id/complete` | Hoàn thành chuyến |
| POST | `/trips/:id/review` | Đánh giá tài xế |
| GET  | `/trips/:id` | Lấy thông tin chuyến |
| POST | `/trips/:id/accept` | (DriverService gọi nội bộ) |
| POST | `/trips/:id/reject` | (DriverService gọi nội bộ) |

---

### 🚗 Driver Service (http://localhost:8082/api)
| Method | Endpoint | Mô tả |
|--------|-----------|-------|
| PUT | `/drivers/:id/location` | Cập nhật vị trí (lat,lng) |
| GET | `/drivers/search` | Tìm tài xế gần nhất |
| PUT | `/drivers/:id/status` | Cập nhật trạng thái online/offline |
| POST | `/drivers/:id/trips/:tripId/accept` | Chấp nhận chuyến |
| POST | `/drivers/:id/trips/:tripId/reject` | Từ chối chuyến |

---

## 🧪 5. Quy trình kiểm thử nhanh

1. **Đăng ký & đăng nhập passenger**
   ```bash
   curl -X POST http://localhost:8081/api/users      -H "Content-Type: application/json"      -d '{"email":"passenger@example.com","password":"123456","role":"passenger"}'
   ```
   → lưu `token` trả về.

2. **Đăng ký & đăng nhập driver** tương tự với `"role":"driver"`.

3. **Driver bật online + cập nhật vị trí**
   ```bash
   curl -X PUT http://localhost:8082/api/drivers/1/status      -H "Authorization: Bearer <JWT_DRIVER>"      -H "Content-Type: application/json"      -d '{"status":"online"}'

   curl -X PUT http://localhost:8082/api/drivers/1/location      -H "Authorization: Bearer <JWT_DRIVER>"      -H "Content-Type: application/json"      -d '{"lat":10.87,"lng":106.8}'
   ```

4. **Passenger tạo chuyến**
   ```bash
   curl -X POST http://localhost:8083/api/trips      -H "Authorization: Bearer <JWT_PASSENGER>"      -H "Content-Type: application/json"      -d '{"passengerId":1,"pickup":"UIT","destination":"Ben Thanh","pickupLat":10.87,"pickupLng":106.8}'
   ```

5. **Driver chấp nhận chuyến**
   ```bash
   curl -X POST http://localhost:8082/api/drivers/1/trips/1/accept      -H "Authorization: Bearer <JWT_DRIVER>"
   ```

6. **Passenger hoàn thành & đánh giá chuyến**
   ```bash
   curl -X POST http://localhost:8083/api/trips/1/complete      -H "Authorization: Bearer <JWT_PASSENGER>"
   curl -X POST http://localhost:8083/api/trips/1/review      -H "Authorization: Bearer <JWT_PASSENGER>"      -H "Content-Type: application/json"      -d '{"rating":5,"comment":"Good driver!"}'
   ```

---

## 🧰 6. Stack sử dụng

| Thành phần | Công nghệ |
|-------------|------------|
| Runtime | Node.js (Express) |
| Database | PostgreSQL |
| Cache / GeoIndex | Redis (ioredis) |
| Authentication | JWT |
| Container | Docker + Docker Compose |
| Communication | REST (Axios) |
| Realtime | Socket.IO (DriverService) |

---

## 🧹 7. Dừng & dọn dữ liệu

```bash
docker compose down -v
```
Thêm `-v` để xóa dữ liệu database và cache Redis.

---

✨ **UIT-Go “Bộ Xương” microservices đã sẵn sàng!**
