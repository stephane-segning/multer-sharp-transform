import * as multer from 'multer';
import { logger } from './helpers/logger';
import { IntegrationHelpers } from './helpers/Integration-helpers';
import { Application } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs';
import { WrapperStorage } from '@ssegning/multer-transform';
import { rimraf } from 'rimraf';
import request = require('supertest');

const uploadPath = path.resolve(__dirname, './tmp-03');

describe('Simple disk upload', () => {
  let app: Application;
  let server: http.Server;

  beforeAll(async () => {
    const wrapperStorage = new WrapperStorage({
      storage: multer.diskStorage({
        destination: uploadPath,
        filename: (req: Express.Request, file: Express.Multer.File, callback: (error: (Error | null), filename: string) => void) => {
          callback(null, file.originalname);
        },
      }),
      logger: logger,
    });

    const tmp = await IntegrationHelpers.getApp(wrapperStorage);
    app = tmp.app;
    server = tmp.server;
  });

  afterAll(() => {
    server.close();
    rimraf(uploadPath);
  });

  it('upload single file', async () => {
    const filePath = path.resolve(__dirname, './samples/sample-1-pexels.jpg');

    await request(app)
      .post('/single')
      .set('Accept', 'application/json')
      .attach('file', filePath)
      .expect(StatusCodes.CREATED)
      .expect((res) => {
        const { file } = JSON.parse(res.text);
        if (file.mimetype !== 'image/jpeg') {
          throw new Error('Mimetype changed');
        }
        if (file.fieldname !== 'file') {
          throw new Error('Wrong field type');
        }
        if (file.size !== fs.readFileSync(filePath).length) {
          throw new Error('Wrong file size');
        }
        if ('transformations' in file) {
          throw new Error('Wrong attribute [transformations] in response file');
        }
      });
  });

  it('upload no file', async () => {
    await request(app)
      .post('/single')
      .set('Accept', 'application/json')
      .expect(StatusCodes.BAD_REQUEST);
  });

});