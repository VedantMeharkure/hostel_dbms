import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import * as ctrl from './controller';

const router = Router();
router.use(authenticate);

router.get('/',     ctrl.listStudents);
router.get('/:id',  ctrl.getStudent);
router.post('/',    authorize('ADMIN'),          ctrl.createStudent);
router.put('/:id',  authorize('ADMIN', 'STAFF'), ctrl.updateStudent);
router.delete('/:id', authorize('ADMIN'),        ctrl.deleteStudent);

export default router;