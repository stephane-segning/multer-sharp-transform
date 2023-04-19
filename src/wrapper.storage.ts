import { StorageEngine } from 'multer';
import sharp from 'sharp';
import { Request } from 'express';
import { from, mergeMap, toArray } from 'rxjs';
import { Readable } from 'stream';
import { CustomLogger, TransformImage, WrapperStorageOptions } from './types';
import ReadableStreamClone from 'readable-stream-clone';

type ResultType = [string, Partial<Express.Multer.File>];

export class WrapperStorage implements StorageEngine {
  private static defaultLogger: CustomLogger = {
    debug(): void {
    },
    error(): void {
    },
    warn(): void {
    },
  };
  private readonly logger: CustomLogger;
  private readonly _storage: StorageEngine;
  private readonly transform: TransformImage;

  public constructor(
    options: WrapperStorageOptions,
  ) {
    this._storage = options.storage;
    this.transform = options.transform || (() => []);
    this.logger = options.logger || WrapperStorage.defaultLogger;
  }

  public get storage(): StorageEngine {
    return this._storage;
  }

  public _handleFile(req: Request, mainFile: Express.Multer.File, callback: (error?: any, info?: Partial<Express.Multer.File>) => void): void {
    const configurations = this.transform(req, mainFile);
    if (configurations.length === 0) {
      this.logger.debug('No sharp configuration provided. Just uploading the provided file');
      this._storage._handleFile(req, mainFile, callback);
      return;
    }

    const sub = from(configurations)
      .pipe(
        mergeMap(({ adjustSharp, ...rest }) => {
          const stream = new ReadableStreamClone(mainFile.stream);
          const sharpInstance = (!adjustSharp ? sharp() : adjustSharp());
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
        mergeMap(({ output: { info, data }, file, label }) => {
          const readable = Readable.from(data);
          const newFile: Express.Multer.File = {
            ...mainFile,
            ...file,
            size: info.size,
            stream: readable,
            buffer: data,
          };

          const upload = new Promise<Partial<Express.Multer.File>>((resolve, reject) => {
            this._storage._handleFile(req, newFile, (error, info) => {
              if (error || !info) {
                this.logger.error('Response is missing');
                reject(error || 'response is missing');
                return;
              }
              resolve(info);
            });
          });

          return from(upload.then(result => [label, result] as ResultType));
        }),
        toArray(),
      )
      .subscribe({
        next: (value) => {
          const transformations: Record<string, Partial<Express.Multer.File>> = value.reduce((prev, [label, value]) => ({
            ...prev,
            [label]: {
              ...value,
              mimetype: value.mimetype || mainFile.mimetype,
            },
          }), {});

          const newFile: Partial<Express.Multer.File> = {
            originalname: mainFile.originalname,
            transformations,
          };
          callback(undefined, newFile);
        },
        error: err => {
          this.logger.error('Could not upload all files successfully');
          callback(err);
        },
        complete: () => {
          sub.unsubscribe();
        },
      });
  }

  public _removeFile(req: Request, file: Express.Multer.File, callback: (error: (Error | null)) => void): void {
    this._storage._removeFile(req, file, callback);
  }
}