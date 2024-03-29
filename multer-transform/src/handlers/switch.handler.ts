import { TransformFile } from '../types';

export function switchTransform(cases: Record<string, TransformFile>): TransformFile {
  const newCases: Record<string, TransformFile> = {};
  const allKeys = Object.keys(cases)
    .map((key) => {
      const idx = key.indexOf('*');
      let newKey = key;
      if (idx === 0) {
        newKey = '';
      }
      if (idx > 0) {
        newKey = key.substring(0, idx);
      }

      newCases[newKey] = cases[key];
      return newKey;
    });

  return (req, file) => {
    const key = allKeys.find((key) => file.mimetype.startsWith(key));
    if (key) {
      return newCases[key](req, file);
    }

    return [];
  };
}
