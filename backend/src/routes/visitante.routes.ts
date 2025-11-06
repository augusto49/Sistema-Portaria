import { Router } from 'express';
import * as visitanteController from '../controllers/visitante.controller';

const router = Router();

router.get('/', visitanteController.getVisitantes);
router.get('/cpf/:cpf', visitanteController.getVisitanteByCpf);
router.post('/', visitanteController.createVisitante);
router.put('/:id', visitanteController.updateVisitante);
router.delete('/:id', visitanteController.deleteVisitante);
router.post('/calcular-prioridade', visitanteController.calcularPrioridadeVisitante);

export default router;
