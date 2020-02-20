import path from 'path';

export const { TABIDISCO_GUI_DIR: guiDir, PORT: port = '3001' } = process.env;
export const dataDir = process.env.TABIDISCO_DATA_DIR || path.resolve(__dirname, '..', 'data');
