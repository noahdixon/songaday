import { Router } from 'express';
import { getContent, getDeliverySettings, likeContent, removeContent, updateDeliverySetting } from '../controllers/UserDataController';
import { checkEntityBody, checkEntityQuery } from '../middlewares/EntityMiddleware';

const router = Router();

router.post('/like', checkEntityBody, likeContent);
router.delete('/remove', checkEntityQuery, removeContent);
router.get('/content', getContent);
router.get('/delivery-settings', getDeliverySettings);
router.put('/delivery-settings', updateDeliverySetting);

export default router;