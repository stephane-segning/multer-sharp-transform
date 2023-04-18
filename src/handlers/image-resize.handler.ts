import { TransformImage } from '../types';
import sharp from 'sharp';
import { Request } from 'express';

export interface ImageResize {
  label?: string;
  prefix?: string;
  width?: number;
  height?: number;
  mimetype?: string;

  filename?: (req: Request, file: Express.Multer.File) => string;
}

export function imageResizeTransform(cases: Record<string, ImageResize>): TransformImage {
  return (req, file) => Object
    .entries(cases)
    .map(([label, value]) => {
      return {
        label: value.label || label,
        file: {
          originalname: !value.filename ? (value.prefix ?? label) + '-' + file.originalname : value.filename(req, file),
          mimetype: value.mimetype || file.mimetype,
          fieldname: file.fieldname,
        },
        adjustSharp: () => {
          let s = sharp();
          if (value.width ?? value.height) {
            s = s.resize({ width: value.width, height: value.height });
          }

          return s;
        },
      };
    });
}