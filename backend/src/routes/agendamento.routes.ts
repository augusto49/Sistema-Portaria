import { Router } from 'express';
import * as agendamentoController from '../controllers/agendamento.controller';

const router = Router();

router.get('/', agendamentoController.getAgendamentos);
router.get('/visitante/:visitanteId', agendamentoController.getAgendamentosByVisitante);
router.get('/sala/:salaId', agendamentoController.getAgendamentosBySala);
router.get('/data', agendamentoController.getAgendamentosByData);
router.get('/pendentes', agendamentoController.getAgendamentosPendentes);
router.post('/', agendamentoController.createAgendamento);
router.put('/:id', agendamentoController.updateAgendamento);
router.put('/:id/cancelar', agendamentoController.cancelAgendamento);
router.post('/validar', agendamentoController.validarAgendamentoController);
router.post('/horarios-disponiveis', agendamentoController.buscarHorariosController);

export default router;
