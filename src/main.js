process.env.TARGET = 'electron';

const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

function createWindow() {
    const isDev = process.env.NODE_ENV && process.env.NODE_ENV.trim() === 'development';

    let win = new BrowserWindow({
        fullscreen: !isDev,
        kiosk: !isDev
    });

    let uri = '';

    if (isDev) {
        uri = url.format({
            pathname: path.join(
                process.env.URI || 'localhost:8080',
                __dirname,
                'dist',
                'electron',
                'index.html'
            ),
            protocol: 'http:',
            slashes: true
        });
        console.log(uri);
    } else {
        uri = url.format({
            pathname: path.join(__dirname, '..', 'dist', 'electron', 'index.html'),
            protocol: 'file:',
            slashes: true
        });
    }

    win.loadURL(uri);
    win.setMenu(null);

    if (isDev || process.env.DEVTOOLS) {
        win.webContents.openDevTools();
    }

    win.on('closed', () => {
        // dereference
        win = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => app.quit());
