import { TransformFile } from '../types';

export const defaultTransform: TransformFile = async (req, file) => [
  { file },
];