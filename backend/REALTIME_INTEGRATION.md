# Real-Time Integration Guide (Chat + Announcements)

This single guide combines setup and usage for both real-time Chat and real-time Announcements using Socket.IO.

- Server uses Socket.IO with JWT auth and room-based broadcasting.
- Rooms are keyed as `${roomType}-${roomId}` where `roomType` is `ACADEMIC` or `COURSE`.
- Clients must join the appropriate room to receive events.

References:
- Server service: `backend/src/services/socketService.ts`
- Chat controller(s): `backend/src/controllers/chatController.ts`, `backend/src/controllers/chatRoomCongroller.ts` (if applicable)
- Announcements controller: `backend/src/controllers/announcementController.ts`

---

## 1) Install Socket.IO Client

```bash
npm install socket.io-client
# or
yarn add socket.io-client
```

---

## 2) Connect with Authentication

The server validates JWTs on the Socket.IO handshake. Provide the token via `auth.token`. Passing `Bearer <jwt>` is supported.

```ts
import { io, Socket } from 'socket.io-client';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';

export function connectSocket(jwt: string): Socket {
  const socket = io(API_BASE, {
    transports: ['websocket'],
    auth: { token: `Bearer ${jwt}` },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 500,
  });

  socket.on('connect', () => console.log('Socket connected', socket.id));
  socket.on('disconnect', (reason) => console.log('Socket disconnected', reason));
  socket.on('connect_error', (err) => console.error('Socket error', err.message));

  return socket;
}
```

---

## 3) Join/Leave Rooms

Join a room to receive both Chat and Announcement events for that scope.

```ts
// COURSE room for a specific course offering
socket.emit('join-chat-room', { roomId: offeringId, roomType: 'COURSE' });

// ACADEMIC room for a specific academic year
socket.emit('join-chat-room', { roomId: academicYearId, roomType: 'ACADEMIC' });

// Leave
socket.emit('leave-chat-room', { roomId: offeringId, roomType: 'COURSE' });
```

You will receive a confirmation event:
```ts
socket.on('joined-chat-room', (data) => console.log('Joined room:', data));
```

---

## 4) Real-Time Chat

### Events to listen
```ts
// New message
socket.on('new-message', (message) => {
  console.log('New message', message);
  // update chat UI
});

// Message deletion
socket.on('message-deleted', ({ messageId }) => {
  console.log('Message deleted', messageId);
  // remove message from UI
});
```

### Typing indicators
```ts
// Start typing
socket.emit('typing-start', { roomId, roomType, userId, userName });

// Stop typing
socket.emit('typing-stop', { roomId, roomType, userId, userName });

// Listen for typing updates
socket.on('typing-update', (data) => {
  console.log('Typing users:', data.typingUsers);
});
```

### React Chat component example (excerpt)
```tsx
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const ChatRoom = ({ roomId, roomType, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000', {
      auth: { token: localStorage.getItem('jwt_token') },
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-chat-room', { roomId, roomType });
    });

    socket.on('new-message', (message) => setMessages(prev => [message, ...prev]));
    socket.on('message-deleted', ({ messageId }) => setMessages(prev => prev.filter(m => m.id !== messageId)));
    socket.on('typing-update', ({ typingUsers }) => setTypingUsers(typingUsers.filter((id: string) => id !== currentUser.id)));

    return () => {
      socket.emit('leave-chat-room', { roomId, roomType });
      socket.disconnect();
    };
  }, [roomId, roomType, currentUser.id]);

  return null;
};
```

---

## 5) Real-Time Announcements

The server emits after create/update/delete in `announcementController.ts` using `emitToChatRoom(scopeId, scope, event, data)`.

### Events to listen
```ts
socket.on('announcement-created', (a) => {
  console.log('New announcement', a);
});

socket.on('announcement-updated', (a) => {
  console.log('Announcement updated', a);
});

socket.on('announcement-deleted', ({ id }) => {
  console.log('Announcement deleted', id);
});
```

### React hook example
```tsx
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

type Scope = 'COURSE' | 'ACADEMIC';

type Announcement = {
  id: string;
  scope: Scope;
  scopeId: string;
  title: string;
  content: string;
  authorId: string | null;
  createdAt: string;
  updatedAt: string;
};

export function useAnnouncements(jwt: string, scope: Scope, scopeId: string) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!jwt || !scope || !scopeId) return;

    const socket = io(process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000', {
      transports: ['websocket'],
      auth: { token: `Bearer ${jwt}` },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-chat-room', { roomId: scopeId, roomType: scope });
    });

    socket.on('announcement-created', (a: Announcement) => {
      if (a.scope === scope && a.scopeId === scopeId) setAnnouncements(prev => [a, ...prev]);
    });

    socket.on('announcement-updated', (a: Announcement) => {
      setAnnouncements(prev => prev.map(x => (x.id === a.id ? a : x)));
    });

    socket.on('announcement-deleted', ({ id }: { id: string }) => {
      setAnnouncements(prev => prev.filter(x => x.id !== id));
    });

    return () => {
      socket.emit('leave-chat-room', { roomId: scopeId, roomType: scope });
      socket.disconnect();
    };
  }, [jwt, scope, scopeId]);

  return { announcements };
}
```

---

## 6) Socket Events Reference

### Client → Server
| Event | Data | Description |
|-------|------|-------------|
| `join-chat-room` | `{roomId, roomType}` | Join a room |
| `leave-chat-room` | `{roomId, roomType}` | Leave a room |
| `typing-start` | `{roomId, roomType, userId, userName}` | Start typing indicator |
| `typing-stop` | `{roomId, roomType, userId, userName}` | Stop typing indicator |

### Server → Client
| Event | Data | Description |
|-------|------|-------------|
| `joined-chat-room` | `{roomId, roomType}` | Confirmation of room join |
| `new-message` | `ChatMessage` | New chat message |
| `message-deleted` | `{messageId, roomId, roomType}` | Message deleted |
| `typing-update` | `{roomKey, typingUsers[]}` | Typing status update |
| `notification` | `NotificationData` | Personal notification |
| `announcement-created` | `Announcement` | New announcement created |
| `announcement-updated` | `Announcement` | Announcement updated |
| `announcement-deleted` | `{id}` | Announcement deleted |

---

## 7) Best Practices

- Use REST API for persistence (sending chat messages, CRUD for announcements); use Socket.IO for instant updates.
- Reconnect on token refresh: update `socket.auth.token` and call `socket.connect()`.
- Handle page visibility to pause/resume connection if desired.
- Debounce typing events; limit in-memory lists for performance.

```ts
// Token refresh reconnect
function refreshConnection(socket: any, getToken: () => string) {
  socket.disconnect();
  socket.auth.token = getToken();
  socket.connect();
}
```

---

## 8) Troubleshooting

- Auth errors: ensure valid JWT; backend uses `process.env.JWT_SECRET` to verify.
- No events: verify you joined the correct room and IDs match.
- Local dev CORS: ensure server Socket.IO CORS allows your client origin.
- Enable debug logs in browser: `localStorage.debug = 'socket.io-client:socket'` (reload page).

---

## 9) Environment Examples

### Development
```ts
const socket = io('http://localhost:3000', { auth: { token: getToken() } });
```

### Production
```ts
const socket = io(process.env.REACT_APP_SERVER_URL!, { auth: { token: getToken() } });
```
