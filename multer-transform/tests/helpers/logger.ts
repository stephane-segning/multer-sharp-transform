import { CustomLogger } from '../../src/types';

export const logger: CustomLogger = {
  debug(args: unknown): void {
    console.log('[debug]', args);
  },
  error(args: unknown): void {
    console.error('[error]', args);
  },
  warn(args: unknown): void {
    console.warn('[warn]', args);
  },
};