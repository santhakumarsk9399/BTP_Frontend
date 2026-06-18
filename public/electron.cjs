const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800
  });

  // Correct path for both dev & installed app
  const indexPath = app.isPackaged
    ? path.join(process.resourcesPath, "app/dist/index.html")
    : path.join(__dirname, "../dist/index.html");

  win.loadFile(indexPath);
}

app.whenReady().then(createWindow);
