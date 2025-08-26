# Real-Time Chat Integration Guide

## Overview
Complete guide for integrating Socket.IO real-time messaging with your frontend application.

## Server Setup ✅
The backend is now configured with:
- **Socket.IO server** with JWT authentication
- **Real-time message broadcasting**
- **Typing indicators**
- **Online user tracking**
- **Room-based messaging**

---

## Client-Side Integration

### 1. Install Socket.IO Client
```bash
npm install socket.io-client
```

### 2. Basic Socket Connection
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: localStorage.getItem('jwt_token') // Your JWT token
  },
  autoConnect: false
});

// Connect when user logs in
socket.connect();
```

### 3. Join Chat Room
```javascript
// Join a chat room when user enters
socket.emit('join-chat-room', {
  roomId: 'your-room-uuid',
  roomType: 'ACADEMIC' // or 'COURSE'
});

// Listen for join confirmation
socket.on('joined-chat-room', (data) => {
  console.log('Joined room:', data);
});
```

### 4. Real-Time Message Handling
```javascript
// Listen for new messages
socket.on('new-message', (message) => {
  console.log('New message received:', message);
  // Add message to your chat UI
  addMessageToChat(message);
});

// Listen for message deletions
socket.on('message-deleted', (data) => {
  console.log('Message deleted:', data);
  // Remove message from your chat UI
  removeMessageFromChat(data.messageId);
});
```

### 5. Typing Indicators
```javascript
let typingTimer;

// Start typing
function onTypingStart(roomId, roomType) {
  socket.emit('typing-start', {
    roomId,
    roomType,
    userId: currentUser.id,
    userName: currentUser.fullName
  });
}

// Stop typing (call this when user stops typing)
function onTypingStop(roomId, roomType) {
  clearTimeout(typingTimer);
  socket.emit('typing-stop', {
    roomId,
    roomType,
    userId: currentUser.id,
    userName: currentUser.fullName
  });
}

// Listen for typing updates
socket.on('typing-update', (data) => {
  console.log('Users typing:', data.typingUsers);
  // Update typing indicator UI
  updateTypingIndicator(data.typingUsers);
});

// Auto-stop typing after 3 seconds of inactivity
function handleTyping(roomId, roomType) {
  onTypingStart(roomId, roomType);
  
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    onTypingStop(roomId, roomType);
  }, 3000);
}
```

### 6. Leave Chat Room
```javascript
// Leave room when user navigates away
socket.emit('leave-chat-room', {
  roomId: 'your-room-uuid',
  roomType: 'ACADEMIC'
});
```

### 7. Error Handling
```javascript
socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
  if (error.message === 'Authentication error: Invalid token') {
    // Redirect to login
    window.location.href = '/login';
  }
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
  // Handle reconnection logic
});
```

---

## React Integration Example

### Chat Component
```jsx
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const ChatRoom = ({ roomId, roomType, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const typingTimerRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io('http://localhost:3000', {
      auth: {
        token: localStorage.getItem('jwt_token')
      }
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      setIsConnected(true);
      // Join the chat room
      socket.emit('join-chat-room', { roomId, roomType });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Chat events
    socket.on('new-message', (message) => {
      setMessages(prev => [message, ...prev]);
    });

    socket.on('message-deleted', (data) => {
      setMessages(prev => prev.filter(msg => msg.id !== data.messageId));
    });

    socket.on('typing-update', (data) => {
      const otherUsers = data.typingUsers.filter(userId => userId !== currentUser.id);
      setTypingUsers(otherUsers);
    });

    // Cleanup on unmount
    return () => {
      socket.emit('leave-chat-room', { roomId, roomType });
      socket.disconnect();
    };
  }, [roomId, roomType, currentUser.id]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    // Send via REST API (for persistence)
    const formData = new FormData();
    formData.append('roomId', roomId);
    formData.append('roomType', roomType);
    formData.append('senderId', currentUser.id);
    formData.append('message', newMessage);

    try {
      await fetch('/api/chat-room/send-message', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        },
        body: formData
      });
      
      setNewMessage('');
      stopTyping();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = () => {
    const socket = socketRef.current;
    if (!socket) return;

    // Start typing
    socket.emit('typing-start', {
      roomId,
      roomType,
      userId: currentUser.id,
      userName: currentUser.fullName
    });

    // Auto-stop after 3 seconds
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(stopTyping, 3000);
  };

  const stopTyping = () => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit('typing-stop', {
      roomId,
      roomType,
      userId: currentUser.id,
      userName: currentUser.fullName
    });
  };

  return (
    <div className="chat-room">
      <div className="connection-status">
        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>
      
      <div className="messages">
        {messages.map(message => (
          <div key={message.id} className="message">
            <strong>{message.sender.fullName}:</strong>
            {message.message && <span>{message.message}</span>}
            {message.fileUrl && (
              <a href={`/api/chat-room/messages/${message.id}/download`}>
                📎 Download File
              </a>
            )}
          </div>
        ))}
      </div>

      {typingUsers.length > 0 && (
        <div className="typing-indicator">
          {typingUsers.length === 1 ? 'Someone is' : `${typingUsers.length} people are`} typing...
        </div>
      )}

      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatRoom;
```

---

## Socket Events Reference

### Client → Server Events
| Event | Data | Description |
|-------|------|-------------|
| `join-chat-room` | `{roomId, roomType}` | Join a chat room |
| `leave-chat-room` | `{roomId, roomType}` | Leave a chat room |
| `typing-start` | `{roomId, roomType, userId, userName}` | Start typing indicator |
| `typing-stop` | `{roomId, roomType, userId, userName}` | Stop typing indicator |

### Server → Client Events
| Event | Data | Description |
|-------|------|-------------|
| `joined-chat-room` | `{roomId, roomType}` | Confirmation of room join |
| `new-message` | `ChatMessage` | New message received |
| `message-deleted` | `{messageId, roomId, roomType}` | Message was deleted |
| `typing-update` | `{roomKey, typingUsers[]}` | Typing status update |
| `notification` | `NotificationData` | Personal notification |

---

## Message Data Structure
```typescript
interface ChatMessage {
  id: string;
  roomId: string;
  roomType: 'ACADEMIC' | 'COURSE';
  senderId: string;
  message?: string;
  fileUrl?: string;
  createdAt: string;
  sender: {
    id: string;
    fullName: string;
    username: string;
  };
}
```

---

## Best Practices

### 1. Connection Management
```javascript
// Reconnect on token refresh
function refreshConnection() {
  socket.disconnect();
  socket.auth.token = localStorage.getItem('jwt_token');
  socket.connect();
}

// Handle page visibility
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    socket.disconnect();
  } else {
    socket.connect();
  }
});
```

### 2. Message Persistence
- **Always use REST API** for sending messages (ensures database persistence)
- **Use WebSocket events** only for real-time updates
- **Load message history** via REST API on room join

### 3. Error Handling
```javascript
// Retry connection on failure
socket.on('connect_error', (error) => {
  setTimeout(() => {
    socket.connect();
  }, 5000);
});
```

### 4. Performance Optimization
```javascript
// Debounce typing events
const debouncedTyping = debounce(handleTyping, 300);

// Limit message history
const MAX_MESSAGES = 100;
setMessages(prev => prev.slice(0, MAX_MESSAGES));
```

---

## Testing Real-Time Features

### 1. Open Multiple Browser Tabs
- Login with different users
- Join the same chat room
- Test message broadcasting

### 2. Test Typing Indicators
- Start typing in one tab
- Verify indicator appears in other tabs
- Test auto-stop after 3 seconds

### 3. Test Connection Handling
- Disconnect internet
- Verify reconnection works
- Test message queuing during disconnection

---

## Environment Configuration

### Development
```javascript
const socket = io('http://localhost:3000', {
  auth: { token: getToken() }
});
```

### Production
```javascript
const socket = io(process.env.REACT_APP_SERVER_URL, {
  auth: { token: getToken() }
});
```

---

## Troubleshooting

### Common Issues
1. **Authentication Error**: Check JWT token validity
2. **Connection Failed**: Verify server is running and CORS is configured
3. **Messages Not Broadcasting**: Ensure users are in the same room
4. **Typing Indicators Stuck**: Check typing-stop events are firing

### Debug Mode
```javascript
localStorage.debug = 'socket.io-client:socket';
// Reload page to see debug logs
```

The real-time chat system is now fully implemented and ready for frontend integration!
