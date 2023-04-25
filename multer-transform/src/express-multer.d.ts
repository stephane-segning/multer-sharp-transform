export global {
  declare module Express {
    export namespace Multer {
      interface File {
        label?: string;
        transformations?: Record<string, Partial<Express.Multer.File>>;
      }
    }
  }
}