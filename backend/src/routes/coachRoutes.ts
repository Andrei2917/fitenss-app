import { Router } from 'express';
import { getAllCoaches, generateAccessCode, getCoachClients, getCoachAccessCodes } from '../controllers/coachController';

const router = Router();
router.get('/', getAllCoaches);
router.post('/generate-code', generateAccessCode);

// NEW: These two routes were missing — the mobile app was already calling them!
router.get('/:coachId/clients', getCoachClients);
router.get('/:coachId/codes', getCoachAccessCodes);

export default router;