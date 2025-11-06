import { Router } from 'express';
import * as acessoController from '../controllers/acesso.controller';

const router = Router();

router.get('/', acessoController.getAcessos);
router.get('/visitante/:visitanteId', acessoController.getAcessosByVisitante);
router.get('/sala/:salaId', acessoController.getAcessosBySala);
router.get('/periodo', acessoController.getAcessosByPeriodo);
router.get('/ativos', acessoController.getAcessosAtivos);
router.get('/agendamento/:agendamentoId', acessoController.getAcessoByAgendamento);
router.post('/', acessoController.createAcesso);
router.put('/:id/saida', acessoController.registrarSaida);

export default router;
