# Image Scanner Full Stack Setup Guide

## Architecture Overview

```
┌─────────────────────────────────────────┐
│     Chrome Extension (Frontend)         │
│  - Scans images from webpage            │
│  - Displays in SidePanel                │
│  - Selects images for upload            │
└──────────────┬──────────────────────────┘
               │
               │ HTTP (CORS enabled)
               ▼
┌─────────────────────────────────────────┐
│      NestJS Backend (Port 3001)         │
│  - REST API Endpoints                   │
│  - Image processing & storage           │
│  - WordPress integration                │
└──────────────┬──────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
  ┌───────────┐  ┌──────────┐
  │PostgreSQL │  │ Uploads  │
  │    DB     │  │ Folder   │
  └───────────┘  └──────────┘
        │
        │ WordPress REST API
        ▼
┌─────────────────────────────────────────┐
│      WordPress Media Library            │
│  - Image storage in cloud               │
│  - Metadata management                  │
└─────────────────────────────────────────┘
```

## 1. Database Setup (PostgreSQL)

### Option A: Using Docker (Recommended)

```bash
cd backend
docker-compose up -d
```

This will start PostgreSQL on `localhost:5432` with:

- Username: `postgres`
- Password: `password`
- Database: `image_scanner`

### Option B: Manual PostgreSQL Installation

Install PostgreSQL and create database:

```bash
psql -U postgres
CREATE DATABASE image_scanner;
```

## 2. Backend Setup (NestJS)

### Install Dependencies

```bash
cd backend
npm install
```

### Configure Environment

Create `.env` file:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/image_scanner"
WORDPRESS_URL="http://localhost/wordpress"
WORDPRESS_USER="admin"
WORDPRESS_PASSWORD="password"
PORT=3001
```

### Initialize Database

```bash
npx prisma migrate dev --name init
```

### Run Backend

```bash
# Development mode (with hot reload)
npm run start:dev

# Production build
npm run build
npm run start:prod
```

Backend API will be at: `http://localhost:3001`

## 3. Frontend (Chrome Extension) Update

The frontend has been updated with:

- Upload to Backend button
- Upload to WordPress button
- Image selection management
- Progress tracking

### Build Frontend

```bash
cd ..  # go to root
npm run build
```

Output will be in `dist/` folder - ready for Chrome Web Store or side-loading.

## 4. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Select the `dist/` folder from this project
5. Extension will appear in your Chrome toolbar

## 5. WordPress Integration Setup

### Prerequisites

- WordPress installed locally or remotely
- Basic auth enabled or Application Passwords plugin

### Configure Credentials

Update `.env` with your WordPress details:

```env
WORDPRESS_URL="http://localhost/wordpress"  # or your WordPress URL
WORDPRESS_USER="admin"                      # WordPress username
WORDPRESS_PASSWORD="your_password"          # WordPress password or app password
```

### Test Connection

```bash
curl -X GET http://localhost:3001/health
```

Expected response:

```json
{
  "status": "ok"
}
```

## 6. Usage Flow

### Step 1: Scan Images

1. Open any webpage in Chrome
2. Click the extension icon in toolbar
3. Click "Quét lại" (Rescan) button
4. Images from the page will appear in the side panel

### Step 2: Select & Filter Images

- Use checkboxes to select images
- Use search box to filter by URL or alt text
- "Chọn" (Select) checkbox selects all visible images

### Step 3: Upload to Backend

1. Select desired images
2. Click "Tải lên BE" (Upload to Backend)
3. Images are:
   - Sent to backend API
   - Saved to PostgreSQL database
   - Stored locally in `/uploads` folder

### Step 4: Publish to WordPress

1. Select images from the list
2. Click "Tải lên WordPress" (Upload to WordPress)
3. Images are:
   - Retrieved from backend
   - Uploaded to WordPress Media Library
   - Stored in WordPress
   - Link saved to database

## API Reference

### POST /api/images/upload

Upload image to backend storage

**Request:**

```json
{
  "filename": "image-123.jpg",
  "originalUrl": "https://example.com/image.jpg",
  "imageBase64": "base64_string_here",
  "mimeType": "image/jpeg"
}
```

**Response:**

```json
{
  "id": 1,
  "filename": "image-123.jpg",
  "url": "/uploads/image-123.jpg",
  "originalUrl": "https://example.com/image.jpg",
  "size": 45678,
  "mimeType": "image/jpeg",
  "status": "pending",
  "createdAt": "2024-02-02T10:30:00Z",
  "updatedAt": "2024-02-02T10:30:00Z"
}
```

### POST /api/images/upload-to-wordpress

Upload stored image to WordPress

**Request:**

```json
{
  "imageId": 1,
  "title": "Image Title",
  "description": "Image Description"
}
```

**Response:**

```json
{
  "id": 1,
  "filename": "image-123.jpg",
  "wordpressMediaId": 2024,
  "wordpressUrl": "http://localhost/wordpress/wp-content/uploads/image-123.jpg",
  "status": "published"
}
```

### GET /api/images

Get all uploaded images

**Response:**

```json
[
  {
    "id": 1,
    "filename": "image-123.jpg",
    "url": "/uploads/image-123.jpg",
    "status": "published",
    "wordpressUrl": "http://localhost/wordpress/wp-content/uploads/image-123.jpg"
  }
]
```

### GET /api/images/:id

Get single image details

### DELETE /api/images/:id

Delete image from storage and database

## Troubleshooting

### Backend won't connect to database

```bash
# Check PostgreSQL is running
docker ps
# or check PostgreSQL service status

# Verify DATABASE_URL in .env
# Try connecting manually:
psql -h localhost -U postgres -d image_scanner
```

### WordPress upload fails

- Verify WordPress URL in .env
- Check WordPress user credentials
- Ensure WordPress REST API is accessible
- Test: `curl -X GET http://localhost/wordpress/wp-json/`

### Extension not showing images

- Check browser console for errors
- Verify backend is running: `curl http://localhost:3001/health`
- Check extension permissions in Chrome

### CORS errors

- Backend already has CORS enabled for `chrome-extension://*`
- If using different setup, update `src/main.ts` CORS config

## Development Commands

```bash
# Backend
npm run start:dev          # Start dev server
npm run build              # Build for production
npm test                   # Run tests
npm run lint              # Run linter

# Frontend
npm run dev               # Dev server
npm run build             # Build extension

# Database
npx prisma studio        # Open database GUI
npx prisma migrate dev   # Create migration
npx prisma db push       # Sync schema
```

## Project Structure

```
├── backend/                          # NestJS backend
│   ├── src/
│   │   ├── images/                  # Image management module
│   │   │   ├── images.controller.ts
│   │   │   ├── images.service.ts
│   │   │   └── services/wordpress.service.ts
│   │   ├── prisma/                  # Database service
│   │   └── main.ts
│   └── prisma/schema.prisma         # Database schema
│
├── src/                              # Chrome extension frontend
│   ├── components/SidePanel.tsx      # Main UI component
│   ├── api/imageAPI.ts              # Backend API client
│   ├── content.ts                    # Content script (image scanner)
│   └── background.ts                # Service worker
│
├── dist/                             # Built extension (ready for Chrome)
└── package.json
```

## Next Steps

1. ✅ Backend setup with NestJS + Prisma + MySQL
2. ✅ Frontend integration with upload buttons
3. ✅ WordPress API integration
4. 📝 Add image validation (size, format checks)
5. 📝 Add batch upload progress tracking
6. 📝 Add image metadata management UI
7. 📝 Add WordPress post creation (from uploaded images)

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review backend logs: `npm run start:dev` output
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly
