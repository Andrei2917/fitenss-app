import { Router } from 'express';
import multer from 'multer';
import { 
  getAllCoaches, 
  generateAccessCode, 
  getCoachClients, 
  getCoachAccessCodes,
  getCoachProfile,
  updateCoachProfile,
  checkSubscription,
  uploadCoverImage
} from '../controllers/coachController';

const upload = multer({ dest: 'uploads/' });


const router = Router();
router.get('/', getAllCoaches);
router.post('/generate-code', generateAccessCode);

router.get('/:coachId/clients', getCoachClients);
router.get('/:coachId/codes', getCoachAccessCodes);

// Coach profile routes
router.get('/:coachId/profile', getCoachProfile);
router.put('/:coachId/profile', updateCoachProfile);

// NEW: Cover image upload
router.post('/:coachId/cover-image', upload.single('coverImage'), uploadCoverImage);

// Check if a user is subscribed to a specific coach
router.get('/:coachId/check-subscription/:userId', checkSubscription);

export default router;