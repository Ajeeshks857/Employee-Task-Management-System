import express from 'express';
import TaskController from './task.controller.js';

const router = express.Router();

router.get('/export/csv', TaskController.exportTasksCsv);
router.get('/', TaskController.listTasks);
router.post('/', TaskController.createTask);
router.get('/:id', TaskController.getTaskById);
router.put('/:id', TaskController.updateTask);
router.put('/:id/status', TaskController.updateTaskStatus);
router.delete('/:id', TaskController.deleteTask);

export default router;
