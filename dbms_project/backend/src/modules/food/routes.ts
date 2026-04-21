import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import * as ctrl from './controller';

const router = Router();
router.use(authenticate);

router.get('/menu',                  ctrl.getWeeklyMenu);
router.put('/menu/:day',             authorize('ADMIN', 'STAFF'), ctrl.updateMenuDay);
router.get('/subscriptions',         ctrl.listSubscriptions);
router.post('/subscriptions',        authorize('ADMIN', 'STAFF'), ctrl.createSubscription);
router.put('/subscriptions/:id',     authorize('ADMIN', 'STAFF'), ctrl.updateSubscription);
router.post('/subscriptions/:id/pay',authorize('ADMIN', 'STAFF'), ctrl.markSubscriptionPaid);

export default router;