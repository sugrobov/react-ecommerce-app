// Test script for authentication endpoints
// Run with: node test-auth.js

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api/auth';

async function testRegistration() {
  console.log('Testing registration...');
  
  const userData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    phone: '+1234567890'
  };
  
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    console.log('Registration response:', data);
    return data;
  } catch (error) {
    console.error('Registration error:', error);
  }
}

async function testLogin() {
  console.log('Testing login...');
  
  const credentials = {
    email: 'test@example.com',
    password: 'password123'
  };
  
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    console.log('Login response:', data);
    return data;
  } catch (error) {
    console.error('Login error:', error);
  }
}

async function testForgotPassword() {
  console.log('Testing forgot password...');
  
  const emailData = {
    email: 'test@example.com'
  };
  
  try {
    const response = await fetch(`${BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData)
    });
    
    const data = await response.json();
    console.log('Forgot password response:', data);
    return data;
  } catch (error) {
    console.error('Forgot password error:', error);
  }
}

async function runTests() {
  console.log('Starting authentication tests...\n');
  
  // Test registration
  const registrationResult = await testRegistration();
  console.log('\n-------------------\n');
  
  // Test login
  const loginResult = await testLogin();
  console.log('\n-------------------\n');
  
  // Test forgot password
  const forgotPasswordResult = await testForgotPassword();
  console.log('\n-------------------\n');
  
  console.log('Tests completed!');
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export { testRegistration, testLogin, testForgotPassword };