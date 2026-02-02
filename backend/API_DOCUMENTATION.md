# Image Scanner REST API Documentation

## Base URL

```
http://localhost:3001/api
```

## Authentication

Currently using Basic Auth for WordPress. Extend with JWT for frontend if needed.

## Endpoints

### 1. Upload Image to Backend

Upload an image scanned from webpage to backend storage.

**Endpoint:** `POST /images/upload`

**Description:**

- Receives base64 encoded image
- Saves to local disk (`/uploads` folder)
- Stores metadata in MySQL database
- Returns image ID and metadata

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "filename": "image-123.jpg",
  "originalUrl": "https://example.com/path/to/image.jpg",
  "imageBase64": "/9j/4AAQSkZJRgABAQEAYABgAAD...",
  "mimeType": "image/jpeg"
}
```

**Query Parameters:** None

**Request Example:**

```bash
curl -X POST http://localhost:3001/api/images/upload \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "photo.jpg",
    "originalUrl": "https://example.com/photo.jpg",
    "imageBase64": "base64_string_here",
    "mimeType": "image/jpeg"
  }'
```

**Response (201 Created):**

```json
{
  "id": 1,
  "filename": "image-123.jpg",
  "url": "/uploads/image-123.jpg",
  "originalUrl": "https://example.com/path/to/image.jpg",
  "size": 123456,
  "mimeType": "image/jpeg",
  "wordpressMediaId": null,
  "wordpressUrl": null,
  "status": "pending",
  "createdAt": "2024-02-02T10:30:45.123Z",
  "updatedAt": "2024-02-02T10:30:45.123Z"
}
```

**Error Responses:**

```json
// 400 Bad Request - Invalid base64
{
  "statusCode": 400,
  "message": "Invalid base64 image data",
  "error": "Bad Request"
}

// 500 Internal Server Error
{
  "statusCode": 500,
  "message": "Failed to save image",
  "error": "Internal Server Error"
}
```

**Status Codes:**

- `201` - Image uploaded successfully
- `400` - Invalid input/base64
- `500` - Server error

---

### 2. Upload Image to WordPress

Push stored image from backend to WordPress Media Library.

**Endpoint:** `POST /images/upload-to-wordpress`

**Description:**

- Retrieves image from database
- Reads file from disk
- Uploads to WordPress via WordPress REST API
- Updates database with WordPress media ID and URL
- Sets status to "published"

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "imageId": 1,
  "title": "My Awesome Image",
  "description": "This is a test image"
}
```

**Query Parameters:** None

**Request Example:**

```bash
curl -X POST http://localhost:3001/api/images/upload-to-wordpress \
  -H "Content-Type: application/json" \
  -d '{
    "imageId": 1,
    "title": "My Photo",
    "description": "Beautiful landscape"
  }'
```

**Response (200 OK):**

```json
{
  "id": 1,
  "filename": "image-123.jpg",
  "url": "/uploads/image-123.jpg",
  "originalUrl": "https://example.com/path/to/image.jpg",
  "size": 123456,
  "mimeType": "image/jpeg",
  "wordpressMediaId": 2024,
  "wordpressUrl": "http://localhost/wordpress/wp-content/uploads/2024/02/image-123.jpg",
  "status": "published",
  "createdAt": "2024-02-02T10:30:45.123Z",
  "updatedAt": "2024-02-02T10:35:20.456Z"
}
```

**Error Responses:**

```json
// 400 Bad Request - Image not found
{
  "statusCode": 400,
  "message": "Image not found",
  "error": "Bad Request"
}

// 400 Bad Request - File not found
{
  "statusCode": 400,
  "message": "Image file not found",
  "error": "Bad Request"
}

// 500 - WordPress upload failed
{
  "statusCode": 500,
  "message": "WordPress upload failed: Invalid credentials",
  "error": "Internal Server Error"
}
```

**Status Codes:**

- `200` - Successfully uploaded to WordPress
- `400` - Image not found or file missing
- `500` - WordPress connection error

---

### 3. Get All Images

Retrieve list of all uploaded images with metadata.

**Endpoint:** `GET /images`

**Description:**

- Returns all images from database
- Ordered by creation date (newest first)
- Includes WordPress upload status

**Request Headers:** None required

**Query Parameters:** None (but can extend for pagination)

**Request Example:**

```bash
curl -X GET http://localhost:3001/api/images
```

**Response (200 OK):**

```json
[
  {
    "id": 3,
    "filename": "image-789.jpg",
    "url": "/uploads/image-789.jpg",
    "originalUrl": "https://example.com/image3.jpg",
    "size": 234567,
    "mimeType": "image/jpeg",
    "wordpressMediaId": 2026,
    "wordpressUrl": "http://localhost/wordpress/wp-content/uploads/2024/02/image-789.jpg",
    "status": "published",
    "createdAt": "2024-02-02T11:00:00.000Z",
    "updatedAt": "2024-02-02T11:05:00.000Z"
  },
  {
    "id": 2,
    "filename": "image-456.png",
    "url": "/uploads/image-456.png",
    "originalUrl": "https://example.com/image2.png",
    "size": 567890,
    "mimeType": "image/png",
    "wordpressMediaId": null,
    "wordpressUrl": null,
    "status": "uploaded",
    "createdAt": "2024-02-02T10:45:00.000Z",
    "updatedAt": "2024-02-02T10:45:00.000Z"
  },
  {
    "id": 1,
    "filename": "image-123.jpg",
    "url": "/uploads/image-123.jpg",
    "originalUrl": "https://example.com/image1.jpg",
    "size": 123456,
    "mimeType": "image/jpeg",
    "wordpressMediaId": null,
    "wordpressUrl": null,
    "status": "pending",
    "createdAt": "2024-02-02T10:30:45.123Z",
    "updatedAt": "2024-02-02T10:30:45.123Z"
  }
]
```

**Error Responses:**

```json
// 500 - Server error
{
  "statusCode": 500,
  "message": "Failed to fetch images",
  "error": "Internal Server Error"
}
```

**Status Codes:**

- `200` - Success (empty array if no images)
- `500` - Server error

---

### 4. Get Single Image

Retrieve metadata for a specific image.

**Endpoint:** `GET /images/:id`

**Description:**

- Returns details for one image
- Includes WordPress upload information if available

**Request Headers:** None required

**Path Parameters:**

- `id` (number, required) - Image ID

**Query Parameters:** None

**Request Example:**

```bash
curl -X GET http://localhost:3001/api/images/1
```

**Response (200 OK):**

```json
{
  "id": 1,
  "filename": "image-123.jpg",
  "url": "/uploads/image-123.jpg",
  "originalUrl": "https://example.com/path/to/image.jpg",
  "size": 123456,
  "mimeType": "image/jpeg",
  "wordpressMediaId": 2024,
  "wordpressUrl": "http://localhost/wordpress/wp-content/uploads/2024/02/image-123.jpg",
  "status": "published",
  "createdAt": "2024-02-02T10:30:45.123Z",
  "updatedAt": "2024-02-02T10:35:20.456Z"
}
```

**Error Responses:**

```json
// 400 - Invalid image ID
{
  "statusCode": 400,
  "message": "Invalid image ID",
  "error": "Bad Request"
}

// 400 - Image not found
{
  "statusCode": 400,
  "message": "Image not found",
  "error": "Bad Request"
}
```

**Status Codes:**

- `200` - Image found
- `400` - Invalid ID or image not found
- `500` - Server error

---

### 5. Delete Image

Remove image from storage and database.

**Endpoint:** `DELETE /images/:id`

**Description:**

- Deletes image file from disk
- Removes image record from database
- Does NOT delete from WordPress (manual cleanup needed)

**Request Headers:** None required

**Path Parameters:**

- `id` (number, required) - Image ID

**Query Parameters:** None

**Request Example:**

```bash
curl -X DELETE http://localhost:3001/api/images/1
```

**Response (200 OK):**

```json
{
  "message": "Image deleted successfully"
}
```

**Error Responses:**

```json
// 400 - Invalid image ID
{
  "statusCode": 400,
  "message": "Invalid image ID",
  "error": "Bad Request"
}

// 400 - Image not found
{
  "statusCode": 400,
  "message": "Image not found",
  "error": "Bad Request"
}
```

**Status Codes:**

- `200` - Image deleted successfully
- `400` - Invalid ID or image not found
- `500` - Server error

---

## Health Check

**Endpoint:** `GET /health`

**Response:**

```json
{
  "status": "ok"
}
```

---

## Data Models

### Image Object

```typescript
interface Image {
  id: number; // Primary key, auto-increment
  filename: string; // File name (e.g., "image-123.jpg")
  url: string; // Local storage path (e.g., "/uploads/image-123.jpg")
  originalUrl: string; // Original web URL
  size: number; // File size in bytes
  mimeType: string; // MIME type (e.g., "image/jpeg")
  wordpressMediaId?: number; // WordPress attachment ID (if uploaded)
  wordpressUrl?: string; // WordPress media URL (if uploaded)
  status: "pending" | "uploaded" | "published"; // Upload status
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}
```

### Status Values

- **pending** - Uploaded to backend, not yet sent to WordPress
- **uploaded** - Successfully sent to WordPress Media Library
- **published** - Ready to use in WordPress posts

---

## Error Handling

All errors follow this format:

```json
{
  "statusCode": number,
  "message": "Error description",
  "error": "Error type"
}
```

**Common Status Codes:**

- `200` - OK
- `201` - Created
- `400` - Bad Request (invalid input)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Currently not implemented. Can be added via `@nestjs/throttler`.

---

## CORS

Enabled for:

- `chrome-extension://*` (Chrome extension)
- `http://localhost:5173` (development frontend)

---

## Authentication (WordPress)

Uses Basic Authentication:

```
Authorization: Basic base64(username:password)
```

Configure in `.env`:

```env
WORDPRESS_USER=admin
WORDPRESS_PASSWORD=your_password
```

---

## Response Examples

### Successful Image Upload

```bash
$ curl -X POST http://localhost:3001/api/images/upload \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "test.jpg",
    "originalUrl": "https://example.com/test.jpg",
    "imageBase64": "...",
    "mimeType": "image/jpeg"
  }'

# Response
{
  "id": 1,
  "filename": "test.jpg",
  "url": "/uploads/test.jpg",
  "status": "pending"
}
```

### Upload to WordPress

```bash
$ curl -X POST http://localhost:3001/api/images/upload-to-wordpress \
  -H "Content-Type: application/json" \
  -d '{
    "imageId": 1,
    "title": "My Photo"
  }'

# Response
{
  "id": 1,
  "status": "published",
  "wordpressMediaId": 2024,
  "wordpressUrl": "http://localhost/wordpress/wp-content/uploads/test.jpg"
}
```

---

## Testing with cURL

### Test backend is running

```bash
curl http://localhost:3001/health
```

### Upload image (with real base64)

```bash
curl -X POST http://localhost:3001/api/images/upload \
  -H "Content-Type: application/json" \
  -d @upload.json
```

Create `upload.json`:

```json
{
  "filename": "test.jpg",
  "originalUrl": "https://example.com/test.jpg",
  "imageBase64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "mimeType": "image/jpeg"
}
```

---

## Integration with Frontend

The frontend `ImageAPI` class handles all these endpoints:

```typescript
// Upload to backend
await ImageAPI.uploadImage(filename, base64, originalUrl, mimeType);

// Upload to WordPress
await ImageAPI.uploadToWordPress(imageId, title, description);

// Get all images
const images = await ImageAPI.getAllImages();

// Get single image
const image = await ImageAPI.getImage(id);

// Delete image
await ImageAPI.deleteImage(id);
```
