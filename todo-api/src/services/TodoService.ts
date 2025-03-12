import { Repository } from 'typeorm';
import { Todo } from '../models/Todo';
import { AppDataSource } from '../config/database';

export class TodoService {
  private todoRepository: Repository<Todo>;

  constructor() {
    this.todoRepository = AppDataSource.getRepository(Todo);
  }

  async getAllTodos(): Promise<Todo[]> {
    return this.todoRepository.find({
      order: {
        createdAt: 'DESC'
      }
    });
  }

  async createTodo(todoData: Partial<Todo>): Promise<Todo> {
    const todo = this.todoRepository.create(todoData);
    return this.todoRepository.save(todo);
  }
} 