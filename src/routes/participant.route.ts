import { Router } from 'express';
import { ParticipantController } from '../controllers/participant.controller';
import { AppDataSource } from '../data-source';


const participantRouter = Router();
const participantController = new ParticipantController(AppDataSource);

participantRouter.get('/', participantController.getAllParticipants);
participantRouter.get('/:id', participantController.getParticipantById);
participantRouter.post('/', participantController.createParticipant);
participantRouter.put('/:id', participantController.updateParticipant);
participantRouter.delete('/', participantController.deleteParticipant);

export default participantRouter;
