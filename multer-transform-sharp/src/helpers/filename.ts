import * as crypto from 'crypto';
import { Request } from 'express';
import { extension } from 'mime-types';

export function genFilename(req: Request, file: Express.Multer.File, cb: (err: unknown, name: string) => void) {
  crypto.randomBytes(16, (err, raw) => {
    const ranHex = err ? 'undefined' : raw.toString('hex');
    const ext = extension(file.mimetype);
    cb(null, ranHex + '.' + ext);
  });
}