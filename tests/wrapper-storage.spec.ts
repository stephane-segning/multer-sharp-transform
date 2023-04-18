import { WrapperStorage } from '../src';
import * as multer from 'multer';
import { logger } from './helpers/logger';

describe('Wrapper Storage - unit tests', () => {
  let wrapperStorage: WrapperStorage;

  beforeEach(async () => {
    wrapperStorage = new WrapperStorage({
      storage: multer.memoryStorage(),
      logger: logger,
    });
  });

  it('basic type', async () => {
    expect(wrapperStorage).toBeInstanceOf(WrapperStorage);
    expect(wrapperStorage.storage).toBeDefined();
  });
});