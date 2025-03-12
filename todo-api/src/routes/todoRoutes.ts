import { Router } from 'express';
import { TodoController } from '../controllers/TodoController';

const router = Router();
const todoController = new TodoController();

// GET all todos
router.get('/', todoController.getAllTodos);

// POST create a new todo
router.post('/', todoController.createTodo);

export default router; 