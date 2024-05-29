import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'url';
import { getDateString } from 'src/components/utilityService.ts'
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL('http://localhost:5173');
  mainWindow.webContents.openDevTools();
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('getRecordingFolderPath', async () => {
  const documentsPath = path.join(os.homedir(), 'Documents', 'Decyphr');
  if (!fs.existsSync(documentsPath)) {
    fs.mkdirSync(documentsPath, { recursive: true });
  }

  const dateString = getDateString();
  let recordingNumber = 1;
  while (fs.existsSync(path.join(documentsPath, `Recording-${recordingNumber}-${dateString}`))) {
    recordingNumber++;
  }

  const recordingFolderPath = path.join(documentsPath, `Recording-${recordingNumber}-${dateString}`);
  fs.mkdirSync(recordingFolderPath, { recursive: true });

  return recordingFolderPath;
});

ipcMain.handle('saveRecordingChunk', async (filePath, buffer) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, Buffer.from(buffer), (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
});
