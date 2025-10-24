# uit-go
Microservices-based ride hailing platform for UIT-Go project
# 🧩 User Service API Documentation

This service handles user registration, authentication, and profile management.
It uses PostgreSQL for storage and bcrypt for password hashing.

---

## 🚀 Base URL

When running with Docker:

```
http://localhost:8081/api/users
```

---

## ⚙️ Environment Variables

The service reads configuration from `.env` file:

| Variable      | Description                           | Example       |
| ------------- | ------------------------------------- | ------------- |
| `PORT`        | Service port                          | `8081`        |
| `DB_USER`     | Postgres username                     | `postgres`    |
| `DB_PASSWORD` | Postgres password                     | `123456`      |
| `DB_NAME`     | Database name                         | `userdb`      |
| `DB_HOST`     | Hostname (use service name in Docker) | `user-db`     |
| `DB_PORT`     | Database port                         | `5432`        |
| `JWT_SECRET`  | Secret key for JWT tokens             | `mysecretkey` |

---

## 📚 API Endpoints

### 1️⃣ Register a new user

**Endpoint:** `POST /api/users`
**Description:** Create a new user account.

#### Request body

```json
{
  "email": "test@example.com",
  "password": "123456",
  "role": "user"
}
```

#### Response 201 Created

```json
{
  "id": 1,
  "email": "test@example.com",
  "role": "user"
}
```

#### Errors

| Code | Description               |
| ---- | ------------------------- |
| 400  | Missing or invalid fields |
| 409  | Email already exists      |
| 500  | Internal server error     |

---

### 2️⃣ Login

**Endpoint:** `POST /api/users/sessions`
**Description:** Authenticate an existing user and receive a JWT token.

#### Request body

```json
{
  "email": "test@example.com",
  "password": "123456"
}
```

#### Response 200 OK

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Errors

| Code | Description               |
| ---- | ------------------------- |
| 400  | Missing email or password |
| 401  | Invalid credentials       |
| 500  | Internal server error     |

---

### 3️⃣ Get user profile (requires token)

**Endpoint:** `GET /api/users/me`
**Description:** Get profile of the currently authenticated user.
**Auth:** Bearer Token (JWT)

#### Headers

```
Authorization: Bearer <your_token_here>
```

#### Response 200 OK

```json
{
  "id": 1,
  "email": "test@example.com",
  "role": "user"
}
```

#### Errors

| Code | Description              |
| ---- | ------------------------ |
| 401  | Missing or invalid token |
| 500  | Internal server error    |

---

## 🧪 Testing with Postman

1. **Register** a user → `POST /api/users/register`
2. **Login** → get JWT token from the response
3. In **Headers tab**, set:

   ```
   Authorization: Bearer <your_token_here>
   ```
4. **GET /api/users/profile** → should return your user info

---

## 🗄️ Database Schema

| Column          | Type         | Constraints     |
| --------------- | ------------ | --------------- |
| `id`            | SERIAL       | Primary key     |
| `email`         | VARCHAR(255) | Unique          |
| `password_hash` | TEXT         | Required        |
| `role`          | VARCHAR(50)  | Default: `user` |

---

## 🧰 Tech Stack

* Node.js + Express
* PostgreSQL
* bcryptjs for password hashing
* jsonwebtoken for JWT authentication
* Docker + docker-compose for deployment

---

## 🧑‍💻 Example docker-compose.yml snippet

```yaml
user-service:
  build: ./user-service
  container_name: user-service
  env_file:
    - ./user-service/.env
  ports:
    - "8081:8081"
  depends_on:
    - user-db
  networks:
    - uitgo-net
  restart: always
```

---

## 🧾 Notes

* Always hash passwords before storing.
* JWT tokens expire (default: 1 day).
* When deployed in Docker, connect to database using `host = user-db`.

---

© UIT-Go Backend | User Service
