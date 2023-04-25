import * as multer from 'multer';
import { logger } from './helpers/logger';
import { IntegrationHelpers } from './helpers/Integration-helpers';
import { Application } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as http from 'http';
import * as path from 'path';
import { WrapperStorage } from '@ssegning/multer-transform';
import request = require('supertest');

describe('Simple memory upload', () => {
  let app: Application;
  let server: http.Server;

  beforeAll(async () => {
    const wrapperStorage = new WrapperStorage({
      storage: multer.memoryStorage(),
      logger: logger,
    });

    const tmp = await IntegrationHelpers.getApp(wrapperStorage);
    app = tmp.app;
    server = tmp.server;
  });

  afterAll(() => {
    server.close();
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
        if (!('size' in file)) {
          throw new Error('Missing attribute [size] in file response');
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