import { Router } from 'express';
import { getAllCoaches, generateAccessCode } from '../controllers/coachController';

const router = Router();
router.get('/', getAllCoaches);
router.post('/generate-code', generateAccessCode);
export default router;