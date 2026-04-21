import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import * as ctrl from './controller';

const router = Router();
router.use(authenticate);

router.get('/',          ctrl.listEvents);
router.get('/:id',       ctrl.getEvent);
router.post('/',         authorize('ADMIN', 'STAFF'), ctrl.createEvent);
router.put('/:id',       authorize('ADMIN', 'STAFF'), ctrl.updateEvent);
router.delete('/:id',    authorize('ADMIN'),          ctrl.deleteEvent);
router.post('/:id/rsvp', ctrl.rsvpEvent);

export default router;