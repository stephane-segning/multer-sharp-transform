import express = require('express');
import multer = require('multer');
import { WrapperStorage } from '../../src';
import { StatusCodes } from 'http-status-codes';

export class IntegrationHelpers {
  public static async getApp(wrapperStorage: WrapperStorage) {
    const upload = multer({
      storage: wrapperStorage,
    });

    const app = express();
    app.get('/health', (req, res, next) => {
      res.status(StatusCodes.OK).json({ status: 'ok' });
    });

    app.post('/single', upload.single('file'), (req, res, next) => {
      res.status(StatusCodes.CREATED).json({file: req.file});
    });

    app.post('/multiple', upload.array('photos', 12), (req, res, next) => {
      res.status(StatusCodes.CREATED).json({files: req.files});
    });

    const server = await app.listen();

    return { server, app };
  }
}