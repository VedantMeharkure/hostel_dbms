import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import * as ctrl from './controller';

const router = Router();
router.use(authenticate);

router.get('/',              ctrl.listRooms);
router.get('/:id',           ctrl.getRoom);
router.post('/',             authorize('ADMIN', 'STAFF'), ctrl.createRoom);
router.put('/:id',           authorize('ADMIN', 'STAFF'), ctrl.updateRoom);
router.delete('/:id',        authorize('ADMIN'),          ctrl.deleteRoom);
router.post('/:id/allocate', authorize('ADMIN', 'STAFF'), ctrl.allocateRoom);
router.post('/:id/transfer', authorize('ADMIN', 'STAFF'), ctrl.transferRoom);

export default router;