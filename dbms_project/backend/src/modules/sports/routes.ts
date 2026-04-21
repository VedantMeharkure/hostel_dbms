import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import * as ctrl from './controller';

const router = Router();
router.use(authenticate);

router.get('/',            ctrl.listEquipment);
router.get('/:id',         ctrl.getEquipment);
router.post('/',           authorize('ADMIN', 'STAFF'), ctrl.addEquipment);
router.put('/:id',         authorize('ADMIN', 'STAFF'), ctrl.updateEquipment);
router.delete('/:id',      authorize('ADMIN'),          ctrl.deleteEquipment);
router.post('/:id/issue',  authorize('ADMIN', 'STAFF'), ctrl.issueEquipment);
router.post('/:id/return', authorize('ADMIN', 'STAFF'), ctrl.returnEquipment);
router.get('/issues/all',  authorize('ADMIN', 'STAFF'), ctrl.listIssues);

export default router;