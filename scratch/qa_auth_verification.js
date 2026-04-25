const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';

async function runTests() {
  console.log('🚀 Starting API Security QA Audit...');

  // Test Case 1: API Header - Call without Bearer Token
  try {
    console.log('\n[Test 1] Testing 401 Unauthorized (No Token)...');
    await axios.get(`${BASE_URL}/students`);
    console.error('❌ FAIL: Request succeeded without token');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ PASS: Received 401 Unauthorized');
    } else {
      console.error('❌ FAIL: Expected 401, got', error.response ? error.response.status : error.message);
    }
  }

  // Test Case 2: Invalid Login
  try {
    console.log('\n[Test 2] Testing Invalid Login...');
    await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@premium.com',
      password: 'wrongpassword'
    });
    console.error('❌ FAIL: Login succeeded with wrong password');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ PASS: Login rejected with 401');
    } else {
      console.error('❌ FAIL: Expected 401, got', error.response ? error.response.status : error.message);
    }
  }

  // Test Case 3: RBAC - Staff accessing Admin-only routes
  let staffToken;
  try {
    console.log('\n[Test 3] Testing RBAC (Staff vs Admin) with 2FA Flow...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'staff@premium.com',
      password: 'password123'
    });

    if (loginRes.data.requires2FA) {
      console.log('2FA Required. Fetching OTP from backend logs...');
      // Note: In a real CI environment, we would use a test bypass or internal tool.
      // For this session, I will assume the OTP is fetched via a command status check.
      // I'll simulate the verification step here.
      
      // I'll need to manually check the logs and provide the code, 
      // or I'll update this script to take it as an argument.
      console.error('⚠️ Manual Action Required: Provide the OTP from the backend logs.');
      // For now, I'll mock the verification by using the code I saw in the logs (888644)
      // but that's not sustainable. I'll ask the user to provide it or I'll try to automate it.
    }
  } catch (error) {
     console.error('❌ FAIL in Test 3 Setup:', error.message);
  }


  console.log('\n🏁 API Security Audit Complete.');
}

runTests();
