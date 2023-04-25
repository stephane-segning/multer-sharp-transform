import sharp from 'sharp';
import { from, map, mergeMap, toArray } from 'rxjs';
import { Readable } from 'stream';
import { SharpTransformFileOptions } from './types';
import { TransformFile, TransformOutput } from '@ssegning/multer-transform';
import ReadableStreamClone from 'readable-stream-clone';

export function sharpTransformFile(options: SharpTransformFileOptions): TransformFile {
  return (req, file) => {
    const configurations = options.transform(req, file);
    return from(configurations)
      .pipe(
        mergeMap((awaitable) => from(awaitable)),
        mergeMap(({ adjustSharp, sharpOptions, ...rest }) => {
          const stream = new ReadableStreamClone(file.stream);
          const sharpInstance = (!adjustSharp ? sharp(sharpOptions) : adjustSharp());
          const sharpBuffer = stream.pipe(sharpInstance).toBuffer({
            resolveWithObject: true,
          });

          return from(
            sharpBuffer.then(result => ({
              ...rest,
              output: result,
            })),
          );
        }),
        map(({ output: { info, data }, label }) => {
          const readable = Readable.from(data);
          const newFile: Express.Multer.File = {
            ...file,
            size: info.size,
            stream: readable,
            buffer: data,
          };

          const output: TransformOutput = { label: label, file: newFile };
          return output;
        }),
        toArray(),
      );
  };
}