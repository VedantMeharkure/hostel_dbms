import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import * as ctrl from './controller';

const router = Router();
router.use(authenticate);

router.get('/',                ctrl.listPayments);
router.get('/:id',             ctrl.getPayment);
router.post('/',               authorize('ADMIN', 'STAFF'), ctrl.createPayment);
router.put('/:id',             authorize('ADMIN', 'STAFF'), ctrl.updatePayment);
router.post('/:id/pay',        authorize('ADMIN', 'STAFF'), ctrl.markPaid);
router.post('/check-overdue',  authorize('ADMIN'),          ctrl.checkOverdue);

export default router;