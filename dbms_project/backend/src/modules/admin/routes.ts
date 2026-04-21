import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import * as ctrl from './controller';

const router = Router();
router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard',        ctrl.getDashboard);
router.get('/users',            ctrl.listUsers);
router.put('/users/:id',        ctrl.updateUser);
router.delete('/users/:id',     ctrl.deleteUser);
router.put('/users/:id/toggle', ctrl.toggleUserStatus);
router.get('/audit-logs',       ctrl.getAuditLogs);

export default router;