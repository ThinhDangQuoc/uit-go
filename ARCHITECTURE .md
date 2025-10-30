# Architecture Overview

Tài liệu này đóng vai trò là tài liệu kỹ thuật cho dự án UIT-Go — một nền tảng gọi xe dựa trên kiến trúc microservices, được phát triển trong khuôn khổ môn học SE360 tại UIT.
Mục tiêu của tài liệu là giúp các thành viên đóng góp nhanh chóng nắm bắt được toàn bộ kiến trúc và mã nguồn, từ đó dễ dàng hợp tác và mở rộng phát triển trong tương lai.

---

## 1. Project Structure

Phần này mô tả tổng quan cấp cao về cấu trúc thư mục và cách tổ chức theo các tầng kiến trúc.

```
[Project Root]/
├── user-service/              # Quản lý người dùng, xác thực và JWT
│   ├── src/
│   │   ├── controllers/       # Xử lý các route đăng ký, đăng nhập, hồ sơ người dùng
│   │   ├── models/            # Các truy vấn cơ sở dữ liệu cho user
│   │   ├── middleware/        # Middleware xác thực JWT
│   │   ├── db/                # Kết nối PostgreSQL và khởi tạo bảng
│   │   └── routes/            # Định nghĩa các route API
│   ├── Dockerfile
│   └── package.json
│
├── driver-service/            # Quản lý dữ liệu tài xế, theo dõi vị trí (Redis Geo)
│   ├── src/
│   │   ├── controllers/       # Đăng ký/cập nhật tài xế và tìm kiếm lân cận
│   │   ├── models/            # Truy vấn SQL cho tài xế
│   │   ├── utils/             # Hàm tiện ích hỗ trợ Redis Geo
│   │   ├── db/                # Khởi tạo PostgreSQL + Redis
│   │   └── routes/            # Định nghĩa router Express
│   ├── Dockerfile
│   └── package.json
│
├── trip-service/              # Quản lý chuyến đi, gán tài xế, đánh giá
│   ├── src/
│   │   ├── controllers/       # Logic cốt lõi của chuyến đi + controller đánh giá
│   │   ├── models/            # Model cho Trip và Review
│   │   ├── services/          # Gọi Axios tới driver-service
│   │   ├── middleware/        # Middleware xác thực JWT
│   │   ├── utils/             # Hằng số và hàm hỗ trợ
│   │   ├── db/                # Khởi tạo schema PostgreSQL
│   │   └── routes/            # Các route Express cho chuyến đi
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml          # Dàn dựng và chạy toàn bộ microservices
├── .env                        # Biến môi trường chung
├── README.md                   # Tổng quan dự án
└── ARCHITECTURE.md             # Tài liệu này
```

---

## 2. High-Level System Diagram

```
[ User (Passenger) ]
         │
         ▼
 [ User Service ]  ←→  [ PostgreSQL ]
         │
 (JWT Token)
         │
         ▼
 [ Trip Service ]  ←→  [ PostgreSQL ]
         │
 (Axios REST API)
         │
         ▼
 [ Driver Service ]  ←→  [ Redis (Geo) ]
```

### Data Flow Summary:
1.Hành khách đăng ký / đăng nhập → User Service phát hành JWT.
2.Hành khách tạo chuyến đi → Trip Service lưu vào cơ sở dữ liệu.
3.Trip Service gọi Driver Service qua REST API để tìm tài xế gần nhất (sử dụng Redis Geo).
4.Chuyến đi được gán cho tài xế gần nhất.
5.Khi chuyến đi hoàn tất → hành khách gửi đánh giá (yêu cầu JWT).
6.Tất cả các service giao tiếp thông qua REST và chạy trong các container Docker.

---

## 3. Core Components

### 3.1. Frontend
**(Dự kiến phát triển trong tương lai)**  
Một dashboard web hoặc ứng dụng di động sẽ tiêu thụ các API từ backend.
Công nghệ đề xuất: React.js hoặc Flutter.

---

### 3.2. Backend Services

#### 3.2.1. User Service
**Name:** User Authentication Service  
**Description:** Xử lý đăng ký, đăng nhập, và lấy thông tin người dùng. Cấp phát JWT cho các service khác. 
**Technologies:** Node.js (Express), PostgreSQL, JWT, bcrypt.js 
**Deployment:** Docker container (cổng 8081 → nội bộ 4000)

#### 3.2.2. Driver Service
**Name:** Driver Location & Management Service  
**Description:** Quản lý dữ liệu tài xế, trạng thái, và vị trí bằng Redis Geo.
**Technologies:** Node.js (Express), PostgreSQL (optional), Redis (GeoSpatial)  
**Deployment:** Docker container (cổng 8082 → nội bộ 4001)

#### 3.2.3. Trip Service
**Name:** Trip Management Service  
**Description:** Tạo và quản lý chuyến đi, gán tài xế và xử lý đánh giá hành khách.
**Technologies:** Node.js (Express), Axios, PostgreSQL, JWT  
**Deployment:** Docker container (cổng 8083 → nội bộ 4002)

---

## 4. Data Stores

### 4.1. PostgreSQL (User & Trip Services)
**Type:** Relational Database  
**Purpose:** Lưu trữ lâu dài tài khoản người dùng, lịch sử chuyến đi và đánh giá.

**Key Tables:**
- `users` → Thông tin người dùng và vai trò
- `trips` → passenger_id, driver_id, điểm đón, điểm đến, giá, trạng thái
- `reviews` → trip_id, passenger_id, driver_id, điểm đánh giá, bình luận

### 4.2. Redis (Driver Service)
**Type:** CSDL trong bộ nhớ, có chỉ mục không gian địa lý (GeoSpatial)
**Purpose:** Lưu và truy vấn vị trí tài xế nhanh chóng.
**Key Data Structures:**  
- `drivers:locations` (GeoSet chứa ID và tọa độ của tài xế.)

---

## 5. External Integrations / APIs

| Service | Purpose | Integration Method |
|----------|----------|--------------------|
| Driver Service | Tìm tài xế gần nhất | REST API nội bộ (Axios) |
| User Service | Xác thực & cấp JWT | REST API nội bộ |
| PostgreSQL | Lưu trữ dữ liệu quan hệ | pg (node-postgres) |
| Redis | Dữ liệu định vị | ioredis (Geo API) |

---

## 6. Deployment & Infrastructure

**Cloud Provider:** Docker (phát triển cục bộ), có thể mở rộng lên Render, AWS hoặc GCP.

**Key Components:**
- Mỗi microservice chạy trong một container riêng.
- File .env chứa thông tin đăng nhập (PostgreSQL, Redis host, cổng, v.v.).
- `docker-compose.yml` điều phối quá trình khởi động các service.

**CI/CD:** Đề xuất sử dụng GitHub Actions.
**Giám sát (tương lai):** Prometheus + Grafana stack.

---

## 7. Security Considerations

- **Authentication:** JWT (HMAC SHA256).  
- **Authorization:** Middleware kiểm tra JWT cho các route bảo vệ (/api/trips/:id/review)
- **Data Encryption:** TLS (trong môi trường production) 
- **Password Storage:** Băm bằng bcrypt (User Service)
- **Environment Secrets:** Lưu trong `.env`

---

## 8. Development & Testing Environment

**Local Setup:**
```bash
git clone https://github.com/<your-repo>/uit-go.git
cd uit-go
docker compose up --build
```

**Testing:** Thủ công bằng Postman hoặc test tích hợp (tương lai với Jest).
**Code Quality:** Sử dụng ESLint và Prettier cho Node.js.

---

## 9. Future Considerations / Roadmap

---

## 10. Project Identification

| Field | Value |
|-------|--------|
| **Project Name** | UIT-Go |
| **Repository URL** | *(to be added)* |
| **Primary Contact** | Hồ Nhật Thành - Đặng Quốc Thịnh - Tạ Ngọc Thành |
| **Team / Course** | SE360 - Computer Science (UIT) |
| **Date of Last Update** | 2025-10-29 |

---

## 11. Glossary / Acronyms

| Acronym | Meaning |
|----------|----------|
| **JWT** | JSON Web Token |
| **API** | Application Programming Interface |
| **DB** | Database |
| **CI/CD** | Continuous Integration / Continuous Deployment |
| **K8s** | Kubernetes |
| **REST** | Representational State Transfer |

---

👉 *End of Document — maintained by Hồ Nhật Thành, SE360 - UIT-Go Project.*
