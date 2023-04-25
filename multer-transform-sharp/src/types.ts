import { Sharp, SharpOptions } from 'sharp';
import { Request } from 'express';
import { ObservableInput } from 'rxjs';

export interface TransformOption {
  label?: string;
  adjustSharp?: () => Sharp;
  sharpOptions?: SharpOptions;
}

export type TransformImage = (req: Request, file: Express.Multer.File) => ObservableInput<TransformOption[]>;

export interface SharpTransformFileOptions {
  transform: TransformImage;
}

export interface ImageResize {
  label?: string;
  prefix?: string;
  width?: number;
  height?: number;
  mimetype?: string;

  filename?: (req: Request, file: Express.Multer.File) => string;
  sharpOptions?: SharpOptions;
}

export interface CustomLogger {
  debug: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}