import { StorageEngine } from 'multer';
import { Request } from 'express';
import { from, mergeMap, Observable, toArray } from 'rxjs';
import { CustomLogger, TransformFile, WrapperStorageOptions } from './types';
import { defaultLogger, defaultTransform } from './helpers';
import { lookup } from 'mime-types';

export class WrapperStorage implements StorageEngine {
  private readonly logger: CustomLogger;
  private readonly storage: StorageEngine;
  private readonly transform: TransformFile;

  public constructor(
    options: WrapperStorageOptions,
  ) {
    this.storage = options.storage;
    this.transform = options.transform || defaultTransform;
    this.logger = options.logger || defaultLogger;
  }

  public _handleFile(req: Request, mainFile: Express.Multer.File, callback: (error?: any, info?: Partial<Express.Multer.File>) => void): void {
    const configurations = this.transform(req, mainFile);
    from(configurations)
      .pipe(
        mergeMap((all) => from(all)),
        mergeMap(({ file, label }) => new Observable<Partial<Express.Multer.File>>((subscriber) => {
          this.storage._handleFile(req, { ...mainFile, stream: mainFile.stream, ...file }, (error, info) => {
            if (error) {
              subscriber.error(error);
            } else {
              subscriber.next({ ...info, label: label || info?.originalname || info?.filename });
            }

            subscriber.complete();
          });
        })),
        toArray(),
      )
      .subscribe({
        next: (value) => {
          if (value.length === 1) {
            return callback(undefined, value[0]);
          }

          const transformations: Record<string, Partial<Express.Multer.File>> = value.reduce((prev, curr) => ({
            ...prev,
            [curr.label!]: {
              ...curr,
              mimetype: lookup(curr.mimetype || curr.filename || '') || curr.mimetype,
            },
          }), {} as Record<string, Partial<Express.Multer.File>>);

          const newFile: Partial<Express.Multer.File> = {
            originalname: mainFile.originalname,
            transformations,
          };
          callback(undefined, newFile);
        },
        error: err => {
          this.logger.error('Could not upload all files successfully', err);
          callback(err);
        },
      });
  }

  public _removeFile(req: Request, file: Express.Multer.File, callback: (error: (Error | null)) => void): void {
    this.storage._removeFile(req, file, callback);
  }
}