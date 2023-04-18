import { Sharp } from 'sharp';
import { Request } from 'express';
import { StorageEngine } from 'multer';

export interface TransformOption {
  label: string;
  adjustSharp?: () => Sharp;
  file: Partial<Pick<Express.Multer.File, 'mimetype' | 'fieldname'>> & Pick<Express.Multer.File, 'originalname'>;
}

export type TransformImage = (req: Request, file: Express.Multer.File) => TransformOption[];

export interface WrapperStorageOptions {
  storage: StorageEngine;
  transform?: TransformImage;
  logger?: CustomLogger;
}

export interface CustomLogger {
  debug: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}