# Image Scanner Backend - NestJS + Prisma + PostgreSQL

## Cấu trúc Backend

```
backend/
├── src/
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   ├── main.ts
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   └── images/
│       ├── images.module.ts
│       ├── images.controller.ts
│       ├── images.service.ts
│       ├── services/
│       │   └── wordpress.service.ts
│       └── dto/
│           └── create-image.dto.ts
├── prisma/
│   └── schema.prisma
├── package.json
└── tsconfig.json
```

## Thiết lập

### 1. Cài đặt Dependencies

```bash
cd backend
npm install
```

### 2. Cấu hình Database

Tạo file `.env` trong thư mục `backend/`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/image_scanner"
WORDPRESS_URL="http://localhost/wordpress"
WORDPRESS_USER="admin"
WORDPRESS_PASSWORD="your_password"
PORT=3001
```

### 3. Khởi động PostgreSQL (dùng Docker)

```bash
docker-compose up -d
```

Hoặc cài đặt PostgreSQL trực tiếp trên máy.

### 4. Khởi tạo Database

```bash
cd backend
npx prisma migrate dev --name init
```

### 5. Chạy Backend

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

Backend sẽ chạy tại `http://localhost:3001`

## API Endpoints

### Upload Image to Backend

**POST** `/api/images/upload`

Body:

```json
{
  "filename": "image.jpg",
  "originalUrl": "https://example.com/image.jpg",
  "imageBase64": "base64_encoded_image_data",
  "mimeType": "image/jpeg"
}
```

### Upload to WordPress

**POST** `/api/images/upload-to-wordpress`

Body:

```json
{
  "imageId": 1,
  "title": "Image Title",
  "description": "Image Description"
}
```

### Get All Images

**GET** `/api/images`

### Get Single Image

**GET** `/api/images/:id`

### Delete Image

**DELETE** `/api/images/:id`

## Flow

1. **Frontend (Extension)**: Quét ảnh từ trang web → Hiển thị trong side panel
2. **Chọn & Upload**: Người dùng chọn ảnh → Gửi lên Backend (lưu DB + file)
3. **Đẩy WordPress**: Chọn ảnh từ DB → Upload lên WordPress Media
4. **Lưu trữ**: Ảnh được lưu trong:
   - PostgreSQL Database (metadata)
   - Disk (`/uploads` folder) - local storage
   - WordPress Media Library (cloud storage)

## Database Schema

```
Image
├── id (Serial) - Primary Key
├── filename (String)
├── url (String) - Local file URL
├── originalUrl (String) - Original web URL
├── size (Int)
├── mimeType (String)
├── wordpressMediaId (Int) - WordPress media ID
├── wordpressUrl (String) - WordPress file URL
├── status (String) - pending, uploaded, published
├── createdAt (DateTime)
└── updatedAt (DateTime)
```
