import { Router } from 'express';
import multer from 'multer';
import { uploadVideo, getCoachVideos, getClientVideos, 
    updateVideo, 
  deleteVideo, purchaseSubscription  
} from '../controllers/videoController';

const router = Router();

// Temporarily store the heavy video file in an "uploads" folder
const upload = multer({ dest: 'uploads/' });
router.post('/upload', upload.single('videoFile'), uploadVideo);
// The frontend will send the file under the field name "videoFile"
router.post('/upload', uploadVideo);router.get('/coach/:coachId', getCoachVideos);
router.get('/client/:userId', getClientVideos);
router.put('/:videoId', updateVideo);
router.delete('/:videoId', deleteVideo);
router.post('/purchase', purchaseSubscription);
export default router;