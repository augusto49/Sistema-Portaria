import { Router } from 'express';
import * as feriadoController from '../controllers/feriado.controller';

const router = Router();

router.get('/', feriadoController.getFeriados);
router.get('/periodo', feriadoController.getFeriadosByPeriodo);
router.post('/', feriadoController.createFeriado);
router.put('/:id', feriadoController.updateFeriado);
router.delete('/:id', feriadoController.deleteFeriado);

export default router;
