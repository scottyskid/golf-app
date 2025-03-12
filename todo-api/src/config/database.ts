import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { Todo } from '../models/Todo';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'todo_db',
  synchronize: true, // Set to false in production
  logging: process.env.NODE_ENV === 'development',
  entities: [Todo],
  subscribers: [],
  migrations: [],
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
}; 