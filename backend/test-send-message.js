const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:3000'; // Adjust port as needed
const CHAT_ROOM_ENDPOINT = '/api/chat-room/send-message';

// Sample test data
const testData = {
  roomId: 'test-room-id',
  roomType: 'ACADEMIC',
  senderId: 'test-user-id',
  message: 'Hello, this is a test message!'
};

// Test 1: Send text message only
async function testTextMessage() {
  console.log('Testing text message...');
  
  const form = new FormData();
  form.append('roomId', testData.roomId);
  form.append('roomType', testData.roomType);
  form.append('senderId', testData.senderId);
  form.append('message', testData.message);

  try {
    const response = await fetch(`${BASE_URL}${CHAT_ROOM_ENDPOINT}`, {
      method: 'POST',
      body: form,
      headers: {
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE' // Replace with actual token
      }
    });

    const result = await response.json();
    console.log('Text message response:', result);
  } catch (error) {
    console.error('Text message test failed:', error.message);
  }
}

// Test 2: Send file only
async function testFileMessage() {
  console.log('Testing file message...');
  
  // Create a test file
  const testFilePath = path.join(__dirname, 'test-file.txt');
  fs.writeFileSync(testFilePath, 'This is a test file content');

  const form = new FormData();
  form.append('roomId', testData.roomId);
  form.append('roomType', testData.roomType);
  form.append('senderId', testData.senderId);
  form.append('file', fs.createReadStream(testFilePath));

  try {
    const response = await fetch(`${BASE_URL}${CHAT_ROOM_ENDPOINT}`, {
      method: 'POST',
      body: form,
      headers: {
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE' // Replace with actual token
      }
    });

    const result = await response.json();
    console.log('File message response:', result);
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
  } catch (error) {
    console.error('File message test failed:', error.message);
    // Clean up test file even if test fails
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  }
}

// Test 3: Send both message and file
async function testMessageWithFile() {
  console.log('Testing message with file...');
  
  // Create a test file
  const testFilePath = path.join(__dirname, 'test-file-with-message.txt');
  fs.writeFileSync(testFilePath, 'This is a test file with message content');

  const form = new FormData();
  form.append('roomId', testData.roomId);
  form.append('roomType', testData.roomType);
  form.append('senderId', testData.senderId);
  form.append('message', 'This message includes a file attachment');
  form.append('file', fs.createReadStream(testFilePath));

  try {
    const response = await fetch(`${BASE_URL}${CHAT_ROOM_ENDPOINT}`, {
      method: 'POST',
      body: form,
      headers: {
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE' // Replace with actual token
      }
    });

    const result = await response.json();
    console.log('Message with file response:', result);
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
  } catch (error) {
    console.error('Message with file test failed:', error.message);
    // Clean up test file even if test fails
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  }
}

// Test 4: Test validation errors
async function testValidationErrors() {
  console.log('Testing validation errors...');
  
  // Test missing required fields
  const form = new FormData();
  form.append('roomId', testData.roomId);
  // Missing roomType and senderId

  try {
    const response = await fetch(`${BASE_URL}${CHAT_ROOM_ENDPOINT}`, {
      method: 'POST',
      body: form,
      headers: {
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE' // Replace with actual token
      }
    });

    const result = await response.json();
    console.log('Validation error response:', result);
  } catch (error) {
    console.error('Validation test failed:', error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('Starting send message route tests...\n');
  
  await testTextMessage();
  console.log('---');
  
  await testFileMessage();
  console.log('---');
  
  await testMessageWithFile();
  console.log('---');
  
  await testValidationErrors();
  
  console.log('\nAll tests completed!');
}

// Instructions for running the tests
console.log(`
INSTRUCTIONS FOR TESTING:
1. Make sure your backend server is running
2. Update the BASE_URL if your server runs on a different port
3. Replace 'YOUR_JWT_TOKEN_HERE' with a valid JWT token
4. Update the test data (roomId, senderId) with valid IDs from your database
5. Run: node test-send-message.js

Expected API Usage:
- POST /api/chat-room/send-message
- Headers: Authorization: Bearer <token>
- Body (multipart/form-data):
  - roomId: string (required)
  - roomType: 'ACADEMIC' | 'COURSE' (required)
  - senderId: string (required)
  - message: string (optional if file provided)
  - file: File (optional if message provided)
`);

// Uncomment the line below to run tests automatically
// runTests();
