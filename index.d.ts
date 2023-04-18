namespace Express {
  namespace Multer {
    interface File {
      transformations: Record<string, Partial<Express.Multer.File>>;
    }
  }
}