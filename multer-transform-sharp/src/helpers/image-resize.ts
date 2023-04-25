import { ImageResize, TransformImage, TransformOption } from '../types';
import sharp from 'sharp';
import { from, map, toArray } from 'rxjs';

export function imageResizeTransform(cases: Record<string, ImageResize>): TransformImage {
  return (req, file) => from(Object.entries(cases))
    .pipe(
      map(([label, value]) => ({
        label: value.label || label,
        file: {
          originalname: !value.filename ? (value.prefix ?? label) + '-' + file.originalname : value.filename(req, file),
          mimetype: value.mimetype || file.mimetype,
          fieldname: file.fieldname,
        },
        adjustSharp: () => {
          let s = value.sharpOptions ? sharp(value.sharpOptions) : sharp();
          if (value.width ?? value.height) {
            s = s.resize({ width: value.width, height: value.height });
          }

          return s;
        },
      } as TransformOption)),
      toArray(),
    );
}