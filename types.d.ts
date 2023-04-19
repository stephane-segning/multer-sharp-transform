export global {
  declare module Express {
    export namespace Multer {
      interface File {
        transformations: Record<string, Partial<Express.Multer.File>>;
      }
    }
  }
}