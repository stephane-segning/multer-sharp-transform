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

    app.post('/single', upload.single('file'), (req, res) => {
      if (!req.file) {
        return res.status(StatusCodes.BAD_REQUEST).send('file not found');
      }
      res.status(StatusCodes.CREATED).json({ file: req.file });
    });

    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json(JSON.stringify(err));
    });

    const server = await app.listen();

    return { server, app };
  }
}