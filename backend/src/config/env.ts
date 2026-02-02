import dotenv from 'dotenv';

dotenv.config();

type Env = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  BACKUP_DIR: string;
  PORT: number;
};

const {
  DATABASE_URL = '',
  JWT_SECRET = '',
  BACKUP_DIR = './backups',
  PORT = '4000',
} = process.env;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

export const env: Env = {
  DATABASE_URL,
  JWT_SECRET,
  BACKUP_DIR,
  PORT: Number(PORT),
};
