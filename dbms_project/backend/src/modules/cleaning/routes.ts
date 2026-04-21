import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import * as ctrl from './controller';

const router = Router();
router.use(authenticate);

router.get('/',               ctrl.listRequests);
router.get('/:id',            ctrl.getRequest);
router.post('/',              ctrl.createRequest);
router.put('/:id',            authorize('ADMIN', 'STAFF'), ctrl.updateRequest);
router.post('/:id/assign',    authorize('ADMIN', 'STAFF'), ctrl.assignRequest);
router.post('/:id/complete',  authorize('ADMIN', 'STAFF'), ctrl.completeRequest);
router.post('/:id/feedback',  ctrl.submitFeedback);

export default router;