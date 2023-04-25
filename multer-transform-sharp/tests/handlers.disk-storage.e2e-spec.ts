import * as multer from 'multer';
import { logger } from './helpers/logger';
import { IntegrationHelpers } from './helpers/Integration-helpers';
import { Application } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as http from 'http';
import * as path from 'path';
import { sharpTransformFile } from '../src/sharp-transform';
import { switchTransform, WrapperStorage } from '@ssegning/multer-transform';
import { imageResizeTransform } from '../src/helpers/image-resize';
import { rimraf } from 'rimraf';
import request = require('supertest');

const uploadPath = path.resolve(__dirname, './tmp-01');

describe('Disk handler upload', () => {
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
      transform: switchTransform({
        'image/*': sharpTransformFile({
          transform: imageResizeTransform({
            original: {},
            xl: { width: 1200, height: 1200 },
            lg: { width: 900, height: 900 },
            md: { width: 600, height: 600 },
            sm: { width: 300, height: 300 },
            thumb: { width: 150, height: 150 },
          }),
        }),
        'application/pdf': () => [],
        '*': () => [],
      }),
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
    const filePath = path.resolve(__dirname, './samples/sample-2-pexels.jpg');

    await request(app)
      .post('/single')
      .set('Accept', 'application/json')
      .attach('file', filePath)
      .expect(StatusCodes.CREATED)
      .expect((res) => {
        const { file } = JSON.parse(res.text);

        Object.entries(file.transformations).forEach(([, value]: any) => {
          if (!value.path.startsWith(uploadPath)) {
            throw new Error(`Uploaded to the wrong dist: ${file.path}`);
          }
          if (!('mimetype' in value)) {
            throw new Error('Mimetype changed');
          }
          if (!('filename' in value)) {
            throw new Error('Wrong field [filename]');
          }
          if (!('size' in value)) {
            throw new Error('Wrong file [size]');
          }
          if ('transformations' in value) {
            throw new Error('Wrong attribute [transformations] in response value');
          }
        });

        if (!('transformations' in file)) {
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