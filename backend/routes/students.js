const express = require('express');
const router = express.Router();
const { getStudents, addStudent, updateStudent, deleteStudent, bulkImportStudents, getMyChildren } = require('../controllers/studentController');
const { protect, authorize, checkPlan } = require('../middleware/auth');

router.use(protect); // All student routes are protected

router.get('/', getStudents);
router.get('/my-children', getMyChildren);
router.post('/', authorize('ADMIN', 'STAFF'), addStudent);
router.post('/bulk', authorize('ADMIN'), checkPlan('STANDARD'), bulkImportStudents);
router.put('/:id', authorize('ADMIN', 'STAFF'), updateStudent);
router.delete('/:id', authorize('ADMIN'), deleteStudent); // Only Admin can delete

module.exports = router;
