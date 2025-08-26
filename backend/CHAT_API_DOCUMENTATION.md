# Chat Room API Documentation

## Overview
Complete API documentation for the chat room messaging system that supports both text messages and file uploads.

## Base URL
```
/api/chat-room
```

## Authentication
All endpoints require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

---

## Endpoints

### 1. Get Chat Messages
Retrieve messages for a specific chat room with pagination.

**Endpoint:** `GET /:roomType/:roomId/messages`

**Parameters:**
- `roomType` (path): `ACADEMIC` | `COURSE`
- `roomId` (path): UUID of the chat room
- `limit` (query, optional): Number of messages to retrieve (default: 50)
- `offset` (query, optional): Number of messages to skip (default: 0)

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "message-uuid",
      "message": "Hello everyone!",
      "fileUrl": null,
      "createdAt": "2025-08-26T04:08:07.000Z",
      "sender": {
        "id": "user-uuid",
        "fullName": "John Doe",
        "username": "johndoe"
      }
    }
  ],
  "count": 25,
  "pagination": {
    "limit": 50,
    "offset": 0
  }
}
```

### 2. Send Message
Send a text message, file, or both to a chat room.

**Endpoint:** `POST /send-message`

**Content-Type:** `multipart/form-data`

**Body Parameters:**
- `roomId` (required): UUID of the chat room
- `roomType` (required): `ACADEMIC` | `COURSE`
- `senderId` (required): UUID of the message sender
- `message` (optional): Text message content
- `file` (optional): File attachment (max 10MB)

**Note:** Either `message` or `file` must be provided.

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "message-uuid",
    "roomId": "room-uuid",
    "roomType": "ACADEMIC",
    "senderId": "user-uuid",
    "message": "Hello with attachment!",
    "fileUrl": "uploads/chat/1724634487123-456789.pdf",
    "createdAt": "2025-08-26T04:08:07.000Z"
  },
  "messageType": "file",
  "fileName": "document.pdf"
}
```

### 3. Delete Message
Delete a message (only the sender can delete their own messages).

**Endpoint:** `DELETE /messages/:messageId`

**Parameters:**
- `messageId` (path): UUID of the message to delete

**Body:**
```json
{
  "userId": "user-uuid"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Message deleted successfully"
}
```

### 4. Download File
Download a file attachment from a message.

**Endpoint:** `GET /messages/:messageId/download`

**Parameters:**
- `messageId` (path): UUID of the message containing the file

**Response:** File download stream with appropriate headers

---

## Chat Room Management Endpoints

### 5. Get Academic Chat Rooms
**Endpoint:** `GET /academic`

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "room-uuid",
      "academicYearId": "year-uuid",
      "name": "Academic Year 2024-2025",
      "createdAt": "2025-08-26T04:08:07.000Z"
    }
  ]
}
```

### 6. Get Academic Chat Room by ID
**Endpoint:** `GET /academic/:id`

### 7. Get Academic Chat Room Members
**Endpoint:** `GET /academic/:id/members`

### 8. Get Course Chat Rooms
**Endpoint:** `GET /course`

### 9. Get Course Chat Room by ID
**Endpoint:** `GET /course/:id`

### 10. Get Course Chat Room Members
**Endpoint:** `GET /course/:id/members`

---

## Error Responses

### Validation Errors (400)
```json
{
  "status": "error",
  "message": "Missing required fields: roomId, roomType, and senderId are required"
}
```

### Authentication Errors (401)
```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

### Permission Errors (403)
```json
{
  "status": "error",
  "message": "You can only delete your own messages"
}
```

### Not Found Errors (404)
```json
{
  "status": "error",
  "message": "Message not found"
}
```

### Server Errors (500)
```json
{
  "status": "error",
  "message": "Internal Server Error"
}
```

---

## Usage Examples

### Send Text Message
```javascript
const formData = new FormData();
formData.append('roomId', 'room-uuid');
formData.append('roomType', 'ACADEMIC');
formData.append('senderId', 'user-uuid');
formData.append('message', 'Hello everyone!');

fetch('/api/chat-room/send-message', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});
```

### Send File with Message
```javascript
const formData = new FormData();
formData.append('roomId', 'room-uuid');
formData.append('roomType', 'COURSE');
formData.append('senderId', 'user-uuid');
formData.append('message', 'Here is the assignment file');
formData.append('file', fileInput.files[0]);

fetch('/api/chat-room/send-message', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});
```

### Get Messages with Pagination
```javascript
fetch('/api/chat-room/ACADEMIC/room-uuid/messages?limit=20&offset=0', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});
```

### Delete Message
```javascript
fetch('/api/chat-room/messages/message-uuid', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: 'user-uuid'
  })
});
```

### Download File
```javascript
fetch('/api/chat-room/messages/message-uuid/download', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
})
.then(response => response.blob())
.then(blob => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'filename.ext';
  a.click();
});
```

---

## File Upload Specifications

- **Maximum file size:** 10MB
- **Storage location:** `uploads/chat/`
- **File naming:** `timestamp-random.extension`
- **Supported formats:** All file types
- **Security:** Files are stored outside web root for security

---

## Database Schema

### Chat Messages Table
```sql
chat_messages (
  id UUID PRIMARY KEY,
  room_type TEXT NOT NULL CHECK (room_type IN ('COURSE', 'ACADEMIC')),
  room_id UUID NOT NULL,
  sender_id UUID NOT NULL REFERENCES users(id),
  message TEXT,
  file_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)
```

---

## Middleware Chain

1. **authenticateToken** - JWT authentication
2. **fileUploadMiddleware** - Multer file upload handling
3. **validateChatMessage** - Input validation
4. **Controller function** - Business logic

---

## Notes

- Messages are ordered by creation date (newest first)
- File URLs are relative paths from the project root
- Both message text and file are optional, but at least one must be provided
- Users can only delete their own messages
- File downloads are streamed for better performance
- All endpoints return consistent JSON response format
