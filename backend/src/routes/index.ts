import { Router } from 'express';
import visitanteRoutes from './visitante.routes';
import salaRoutes from './sala.routes';
import agendamentoRoutes from './agendamento.routes';
import acessoRoutes from './acesso.routes';
import feriadoRoutes from './feriado.routes';

const router = Router();

router.use('/visitantes', visitanteRoutes);
router.use('/salas', salaRoutes);
router.use('/agendamentos', agendamentoRoutes);
router.use('/acessos', acessoRoutes);
router.use('/feriados', feriadoRoutes);

export default router;
