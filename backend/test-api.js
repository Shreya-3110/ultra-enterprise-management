const axios = require('axios');

async function testAudit() {
  try {
    console.log('Logging in...');
    const loginRes = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'admin@premium.com',
      password: 'password123'
    });
    
    const token = loginRes.data.token;
    console.log('Login successful. Token acquired.');

    console.log('Fetching audit logs...');
    try {
      const auditRes = await axios.get('http://localhost:5000/api/v1/audit', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('AUDIT SUCCESS:', auditRes.data.count, 'logs found.');
    } catch (err) {
      console.log('AUDIT FAILED:', err.response?.data?.message || err.message);
    }

    console.log('Fetching dashboard stats...');
    try {
      const dashboardRes = await axios.get('http://localhost:5000/api/v1/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('DASHBOARD SUCCESS:', JSON.stringify(dashboardRes.data.data, null, 2));
    } catch (err) {
      console.log('DASHBOARD FAILED:', err.response?.data?.message || err.message);
    }
  } catch (err) {
    console.log('Login failed:', err.message);
  }
}

testAudit();
