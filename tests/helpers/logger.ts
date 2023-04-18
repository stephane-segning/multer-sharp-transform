import { CustomLogger } from '../../src/types';

export const logger: CustomLogger = {
  debug(args: unknown): void {
    console.log('>> ', args);
  },
  error(args: unknown): void {
    console.log('!! ', args);
  },
  warn(args: unknown): void {
    console.log('-- ', args);
  },

};