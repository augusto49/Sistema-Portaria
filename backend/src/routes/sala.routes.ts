import { Router } from 'express';
import * as salaController from '../controllers/sala.controller';

const router = Router();

router.get('/', salaController.getSalas);
router.get('/:id', salaController.getSalaById);
router.post('/', salaController.createSala);
router.put('/:id', salaController.updateSala);
router.delete('/:id', salaController.deleteSala);
router.get('/:salaId/responsaveis', salaController.getResponsaveis);
router.post('/responsaveis', salaController.createResponsavel);

export default router;
