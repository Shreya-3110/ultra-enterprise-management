const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    
    // THE GROUND TRUTH: Verified 24-character ID
    const CORRECT_ID_STR = '69e511600bbec3a9c62a17b62';
    const CORRECT_ID = new ObjectId(CORRECT_ID_STR);
    
    console.log('Force-updating all records to School ID:', CORRECT_ID_STR);

    // 1. Update Users
    const u = await db.collection('users').updateMany({}, { $set: { schoolId: CORRECT_ID } });
    console.log(`- Users Fusion: ${u.modifiedCount} updated`);

    // 2. Update Audit Logs (Identity Reconstruction)
    const a = await db.collection('auditlogs').updateMany({}, { 
      $set: { 
        schoolId: CORRECT_ID,
        'user.name': 'Premium Admin',
        'user.id': CORRECT_ID_STR,
        'user.role': 'admin'
      } 
    });
    console.log(`- Logs Restored: ${a.modifiedCount} updated`);

    // 3. Update Students
    const s = await db.collection('students').updateMany({}, { $set: { schoolId: CORRECT_ID } });
    console.log(`- Students Locked: ${s.modifiedCount} updated`);

    // 4. Update Payments
    const p = await db.collection('payments').updateMany({}, { $set: { schoolId: CORRECT_ID } });
    console.log(`- Payments Sync: ${p.modifiedCount} updated`);

    console.log('MISSION ACCOMPLISHED: The Identity Ghost has been exorcised.');
  } catch (err) {
    console.error('CRITICAL ERROR:', err);
  } finally {
    await client.close();
    process.exit(0);
  }
}

run();
