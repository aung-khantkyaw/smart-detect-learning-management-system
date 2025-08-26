# Real-time Announcements Client Setup (Socket.IO) — Moved

This content has been consolidated into a single guide: `backend/REALTIME_INTEGRATION.md`.

Please refer to `REALTIME_INTEGRATION.md` for the latest, combined instructions covering both Chat and Announcements.

Backend emits the following events from `announcementController.ts` using `global.socketService.emitToChatRoom(...)`:
- `announcement-created`
- `announcement-updated`
- `announcement-deleted`

Rooms are keyed as `${roomType}-${roomId}` in `SocketService`.
- COURSE room: `roomType = "COURSE"`, `roomId = <course_offerings.id>`
- ACADEMIC room: `roomType = "ACADEMIC"`, `roomId = <academic_years.id>`

## 1) Install client dependency

```bash
npm install socket.io-client
# or
yarn add socket.io-client
```

## 2) Connect with authentication

The Socket.IO server expects a JWT. It accepts:
- `handshake.auth.token` containing a string token. You can pass either the raw JWT or `Bearer <jwt>`.

Example minimal client:

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

## 3) Join the room you want to receive announcements for

```ts
// COURSE announcements for a specific course offering
socket.emit('join-chat-room', { roomId: offeringId, roomType: 'COURSE' });

// ACADEMIC announcements for a specific academic year
socket.emit('join-chat-room', { roomId: academicYearId, roomType: 'ACADEMIC' });
```

You can leave with:
```ts
socket.emit('leave-chat-room', { roomId: offeringId, roomType: 'COURSE' });
```

## 4) Listen to announcement events

```ts
socket.on('announcement-created', (a) => {
  console.log('New announcement', a);
});

socket.on('announcement-updated', (a) => {
  console.log('Announcement updated', a);
});

socket.on('announcement-deleted', (payload: { id: string }) => {
  console.log('Announcement deleted', payload.id);
});
```

## 5) Example: React hook for announcements

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
      if (a.scope === scope && a.scopeId === scopeId) {
        setAnnouncements((prev) => [a, ...prev]);
      }
    });

    socket.on('announcement-updated', (a: Announcement) => {
      setAnnouncements((prev) => prev.map((x) => (x.id === a.id ? a : x)));
    });

    socket.on('announcement-deleted', ({ id }: { id: string }) => {
      setAnnouncements((prev) => prev.filter((x) => x.id !== id));
    });

    return () => {
      socket.emit('leave-chat-room', { roomId: scopeId, roomType: scope });
      socket.disconnect();
    };
  }, [jwt, scope, scopeId]);

  return { announcements };
}
```

## 6) Suggested UX

- Show a toast/snackbar on `announcement-created` when user is in that room but not on the announcements page.
- Add a badge counter for unseen announcements. Persist locally or fetch latest on page focus.

## 7) Tips / Troubleshooting

- 401/Authentication errors at socket connect: ensure JWT is valid and not expired. The server reads `process.env.JWT_SECRET`.
- Not receiving events: confirm you joined the correct room and that `scopeId` matches the server-side announcement `scopeId`.
- CORS: if running locally across ports, ensure server Socket.IO CORS allows your client origin.

## 8) Server-side reference

- Service: `backend/src/services/socketService.ts`
- Emits: `emitToChatRoom(roomId, roomType, event, data)`
- Rooms: `join-chat-room` / `leave-chat-room` events
- Announcement emits occur in `backend/src/controllers/announcementController.ts` after create/update/delete.
