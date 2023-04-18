import { WrapperStorage } from '../src';
import * as multer from 'multer';
import { logger } from './helpers/logger';
import { IntegrationHelpers } from './helpers/Integration-helpers';
import { Application } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as http from 'http';
import * as path from 'path';
import { rimraf } from 'rimraf';
import request = require('supertest');
import * as fs from 'fs';

describe('Simple upload', () => {
  let app: Application;
  let server: http.Server;

  beforeAll(async () => {
    const uploadPath = path.resolve(__dirname, './uploads');
    const wrapperStorage = new WrapperStorage({
      storage: multer.diskStorage({
        destination: uploadPath,
        filename: (req: Express.Request, file: Express.Multer.File, callback: (error: (Error | null), filename: string) => void) => {
          console.log({ file });

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
    const uploadPath = path.resolve(__dirname, './uploads');
    rimraf(uploadPath);
  });

  it('can get server system info', async () => {
    const filePath = path.resolve(__dirname, './samples/sample-1-pexels.jpg');

    await request(app)
      .post('/single')
      .set('Accept', 'application/json')
      .attach('file', filePath)
      .expect((res) => {
        const { file } = JSON.parse(res.text);
        if (file.path !== path.resolve(__dirname, './uploads/sample-1-pexels.jpg')) {
          throw new Error('Uploaded to the wrong dist');
        }
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
      })
      .expect(StatusCodes.CREATED);
  });

  it('upload no file', async () => {
    await request(app)
      .post('/single')
      .set('Accept', 'application/json')
      .expect((res) => {
        const result = JSON.parse(res.text);
        if ('file' in result) {
          throw new Error('Wrong attribute [file] in response');
        }
      })
      .expect(StatusCodes.CREATED);
  });

});