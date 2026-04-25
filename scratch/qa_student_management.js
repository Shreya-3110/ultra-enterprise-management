const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZWJiNTdkMjBjOTM0YWE1ZGMyZGFlNyIsImlhdCI6MTc3NzA1ODM3OSwiZXhwIjoxNzc5NjUwMzc5fQ.6YyvznSC_gE6KJrzdQ86gq6MT0jZZOamQAQE7SrhzeA';

const headers = { Authorization: `Bearer ${TOKEN}` };

async function testStudentManagement() {
  console.log('🚀 Starting Pillar 2: Student Management QA Audit...');

  let testStudentId;

  // 1. Test Case 2.1: Enrollment & Wallet Initialization
  try {
    console.log('\n[Test 2.1] Testing Enrollment & Wallet Initialization...');
    const enrollmentData = {
      firstName: 'Audit',
      lastName: 'Student',
      admissionNumber: 'QA-TEST-001',
      currentClass: 'X-A',
      parentDetails: {
        name: 'Audit Parent',
        phone: '1112223333'
      }
    };
    
    const res = await axios.post(`${BASE_URL}/students`, enrollmentData, { headers });
    testStudentId = res.data.data._id;
    
    if (res.data.data.walletBalance === 0) {
      console.log('✅ PASS: Student created with 0 wallet balance');
    } else {
      console.error('❌ FAIL: Expected 0 balance, got', res.data.data.walletBalance);
    }
  } catch (error) {
    console.error('❌ FAIL in Enrollment:', error.response ? error.response.data : error.message);
  }

  // 2. Test Case 2.2: ID Uniqueness
  try {
    console.log('\n[Test 2.2] Testing ID Uniqueness (Duplicate Admission No.)...');
    await axios.post(`${BASE_URL}/students`, {
      firstName: 'Duplicate',
      lastName: 'Test',
      admissionNumber: 'QA-TEST-001', // Same as above
      currentClass: 'X-A'
    }, { headers });
    console.error('❌ FAIL: Request succeeded with duplicate ID');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ PASS: Received 400 Bad Request for duplicate ID');
    } else {
      console.error('❌ FAIL: Expected 400, got', error.response ? error.response.status : error.message);
    }
  }

  // 3. Test Case 2.3: Search Filter
  try {
    console.log('\n[Test 2.3] Testing Search Filter...');
    const res = await axios.get(`${BASE_URL}/students?search=Audit`, { headers });
    const students = res.data.data;
    if (students.length > 0 && students[0].firstName === 'Audit') {
      console.log('✅ PASS: Search filter returned the correct student');
    } else {
      console.error('❌ FAIL: Search did not find the test student');
    }
  } catch (error) {
    console.error('❌ FAIL in Search:', error.response ? error.response.data : error.message);
  }

  console.log('\n🏁 Pillar 2 Audit Complete.');
}

testStudentManagement();
