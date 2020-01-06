import { networkInterfaces } from 'os';

const { TABIDISCO_GUI_DIR, PORT = '3001' } = process.env;

function getExternalIp() {
  const ifaces = networkInterfaces();
  const iface = Object.values(ifaces)
    .flatMap(iface => iface)
    .find(iface => iface.family === 'IPv4' && !iface.internal);
  return iface ? iface.address : 'localhost';
}

export const guiDir = TABIDISCO_GUI_DIR;
export const port = parseInt(PORT);
export const externalIp = getExternalIp();
