import { Request, Response } from 'express';
import { TodoService } from '../services/TodoService';

export class TodoController {
  private todoService: TodoService;

  constructor() {
    this.todoService = new TodoService();
  }

  getAllTodos = async (req: Request, res: Response): Promise<void> => {
    try {
      const todos = await this.todoService.getAllTodos();
      res.status(200).json({
        success: true,
        data: todos
      });
    } catch (error) {
      console.error('Error fetching todos:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch todos',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  createTodo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, description } = req.body;
      
      if (!title) {
        res.status(400).json({
          success: false,
          message: 'Title is required'
        });
        return;
      }

      const todo = await this.todoService.createTodo({
        title,
        description,
        completed: false
      });

      res.status(201).json({
        success: true,
        data: todo
      });
    } catch (error) {
      console.error('Error creating todo:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create todo',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
} 