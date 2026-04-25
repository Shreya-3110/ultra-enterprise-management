const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'FOUND' : 'NOT FOUND');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'FOUND' : 'NOT FOUND');
console.log('Full PATH to .env:', path.resolve(__dirname, '../.env'));
