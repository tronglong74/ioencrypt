const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

let mainWindow = null;

// Tạo cửa sổ Electron
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: false, // Khuyến khích false để tăng bảo mật
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'), // Sử dụng preload để giao tiếp IPC an toàn
    },
  });

  // Khi chạy ở dev, load localhost. Khi build, load file index.html từ build
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (mainWindow === null) createWindow();
});

// ----------------- LOGIC MÃ HOÁ, GIẢI MÃ ----------------- //

// Tạo file key.json: { algorithm, key, iv }
function generateKeyAndSave(keyFolder) {
  if (!fs.existsSync(keyFolder)) {
    throw new Error('Thư mục key không tồn tại');
  }
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);
  const algorithm = 'aes-256-cbc';

  const keyObject = {
    algorithm,
    key: key.toString('base64'),
    iv: iv.toString('base64'),
  };
  const keyPath = path.join(keyFolder, 'key.json');
  fs.writeFileSync(keyPath, JSON.stringify(keyObject, null, 2), 'utf-8');

  return {
    message: 'Tạo key thành công!',
    keyPath,
  };
}

function getKeyObject(keyFolder) {
  const keyPath = path.join(keyFolder, 'key.json');
  if (!fs.existsSync(keyPath)) {
    throw new Error('Không tìm thấy file key.json trong thư mục đã chọn');
  }
  const data = fs.readFileSync(keyPath, 'utf-8');
  const { algorithm, key, iv } = JSON.parse(data);
  return {
    algorithm,
    key: Buffer.from(key, 'base64'),
    iv: Buffer.from(iv, 'base64'),
  };
}

function encryptFiles(keyFolder, sourceDir, outputDir) {
  if (!fs.existsSync(sourceDir)) {
    throw new Error('Thư mục nguồn không tồn tại');
  }
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const { algorithm, key, iv } = getKeyObject(keyFolder);

  const files = fs.readdirSync(sourceDir);
  files.forEach((file) => {
    const sourcePath = path.join(sourceDir, file);
    const stat = fs.statSync(sourcePath);
    if (stat.isFile()) {
      const outputPath = path.join(outputDir, file + '.enc');
      const cipher = crypto.createCipheriv(algorithm, key, iv);

      const inputStream = fs.createReadStream(sourcePath);
      const outputStream = fs.createWriteStream(outputPath);

      inputStream.pipe(cipher).pipe(outputStream);
    }
  });

  return { message: 'Mã hoá thành công!' };
}

function decryptFiles(keyFolder, sourceDir, outputDir) {
  if (!fs.existsSync(sourceDir)) {
    throw new Error('Thư mục nguồn không tồn tại');
  }
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const { algorithm, key, iv } = getKeyObject(keyFolder);

  const files = fs.readdirSync(sourceDir);
  files.forEach((file) => {
    const sourcePath = path.join(sourceDir, file);
    const stat = fs.statSync(sourcePath);
    if (stat.isFile()) {
      const outFileName = file.replace(/\.enc$/, '');
      const outputPath = path.join(outputDir, outFileName);
      const decipher = crypto.createDecipheriv(algorithm, key, iv);

      const inputStream = fs.createReadStream(sourcePath);
      const outputStream = fs.createWriteStream(outputPath);

      inputStream.pipe(decipher).pipe(outputStream);
    }
  });

  return { message: 'Giải mã thành công!' };
}

// ----------------- IPC HANDLERS ----------------- //
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

ipcMain.handle('generate-key', (event, { keyDir }) => {
  return generateKeyAndSave(keyDir);
});

ipcMain.handle('encrypt-files', (event, { keyDir, sourceDir, outputDir }) => {
  return encryptFiles(keyDir, sourceDir, outputDir);
});

ipcMain.handle('decrypt-files', (event, { keyDir, sourceDir, outputDir }) => {
  return decryptFiles(keyDir, sourceDir, outputDir);
});
