import { Router } from 'express';
import { getCourses } from '../controller/getCourses';

const router = Router();

router.get('/', getCourses);

export default router;