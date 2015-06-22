var app = require('app')
var BrowserWindow = require('browser-window')
var crashReporter = require('crash-reporter')
var Menu = require('menu')
var ipc = require('ipc')
var dialog = require('dialog')
var fs = require('fs')
var path = require('path')

var darwinTemplate = require('./darwin-menu.js')
var otherTemplate = require('./other-menu.js')

var emptyData = require('./empty-data.json')

var mainWindow = null
var menu = null

crashReporter.start()

app.on('window-all-closed', function appQuit () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('ready', function appReady () {
  mainWindow = new BrowserWindow({width: 800, height: 900, title: 'Git-it'})
  mainWindow.loadUrl('file://' + __dirname + '/index.html')

  var userDataPath = path.join(app.getPath('userData'), 'user-data.json')

  fs.exists(userDataPath, function (exists) {
    if (!exists) {
      fs.writeFile(userDataPath, JSON.stringify(emptyData, null, ' '), function (err) {
        if (err) return console.log(err)
      })
    }
  })

  ipc.on('getUserDataPath', function (event) {
    event.sender.send('haveUserDataPath', userDataPath)
  })

  ipc.on('open-file-dialog', function (event) {
    var files = dialog.showOpenDialog({ properties: [ 'openFile', 'openDirectory' ]})
    if (files) {
      event.sender.send('selected-directory', files)
    }
  })

  if (process.platform === 'darwin') {
    menu = Menu.buildFromTemplate(darwinTemplate(app, mainWindow))
    Menu.setApplicationMenu(menu)
  } else {
    menu = Menu.buildFromTemplate(otherTemplate(mainWindow))
    mainWindow.setMenu(menu)
  }

  mainWindow.on('closed', function winClosed () {
    mainWindow = null
  })
})
