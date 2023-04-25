import { Request } from 'express';
import { StorageEngine } from 'multer';
import { ObservableInput } from 'rxjs';

export interface TransformOutput {
  file: Partial<Express.Multer.File>;

  label?: string;
}

export type TransformFile = (req: Request, file: Express.Multer.File) => ObservableInput<TransformOutput[]>;

export interface WrapperStorageOptions {
  storage: StorageEngine;
  transform?: TransformFile;
  logger?: CustomLogger;
}

export interface CustomLogger {
  debug: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}