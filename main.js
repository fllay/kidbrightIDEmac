//process.env.NODE_ENV = process.env.NODE_ENV || 'production';
const {
    app,
    BrowserWindow,
    dialog
} = require('electron')

const ProgressBar = require('electron-progressbar');
const url = require('url')
const path = require('path')
const fs = require('fs')

const console = require('console');

app.console = new console.Console(process.stdout, process.stderr);

console.log("PATH = ")
console.log(__dirname + "/esp32/lib/release")
const pp = __dirname + "/esp32/lib/release"
if(process.platform == "darwin"){
    serverPath = __dirname + '/kidbrightide'
} else if(process.platform == "win32"){
    serverPath = __dirname + '/kidbrightide.exe'
} else {
    serverPath = __dirname + '/kidbrightide'
}
console.log("PATH = ")
console.log(pp + '/common.mk')
console.log("Server path = ")
console.log(serverPath)



 
const {
    execFile
} = require('child_process');
const child = execFile(serverPath, {cwd:__dirname},(error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }


});

child.stdout.on('data', (data) => {
    app.console.log(`child stdout:\n${data}`);

    var val1 = data.match(/(\d+)%/);
    if(val1 != null){
        progressBar.value = Number(val1[1]); 
        progressBar.detail = data;
        app.console.log(progressBar.value);
    } else {
        /*if(progressBar.detail !=null){
            progressBar.detail = data;
        }*/
    }



    if (data.match(/(webserver listening on port)/)) {
        progressBar.setCompleted();
        //splash.destroy();
        console.log("Server is up");

       /* fs.readFile(pp + '/common.mk', 'utf8', function (err, data) {
            if (err) {
                return console.log(err);
            }

            var result = data.replace(new RegExp('\\$\\(RELEASE_DIR\\)', 'g'), pp);
            fs.writeFile(pp + '/common.mk', result, 'utf8', function (err) {
                if (err) {
                    return console.log(err);
                };
            });
        });*/

        var config = require(__dirname + '/app/config.json')
        console.log(config.webserver.port)

 
        /* win.loadURL(url.format({
             pathname: path.join(__dirname, 'index.html'),
             protocol: 'file:',
             slashes: true
         }));*/

        win.loadURL('http://localhost:' + config.webserver.port)
        //win.webPreferences.openDevTools()
        //win.webContents.openDevTools()
        // Emitted when the window is closed.

    

        win.on('closed', () => {
            // Dereference the window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            win = null
        })

    

    } else {
        
    }

});

child.stderr.on('data', (data) => {
    console.error(`child stderr:\n${data}`);
    if(data.match(/(EADDRINUSE)/)){
        if(progressBar != null){
            progressBar.setCompleted();
            dialog.showMessageBox(win, {
                type: "info",
                buttons: ["Dismiss"],
                title: "Error",
                message: "Error",
                detail: data
            }, resp => {
                
            })
        }
    }
});





app.on('ready', () => {
    //splash = new BrowserWindow({width: 810, height: 610, transparent: true, frame: false, alwaysOnTop: true});
    win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: false
        }, icon: path.join(__dirname, 'assets/icons/png/Icon-64.png')
    })

    //splash.loadURL(`file://${__dirname}/splash.html`);
	progressBar = new ProgressBar({
		indeterminate: false,
		text: 'Updating..',
        detail: 'Please Wait...',
        maxValue: 100.1
	});
	
	progressBar
		.on('completed', function() {
			console.info(`completed...`);
			progressBar.detail = 'Task completed. Exiting...';
		})
		.on('aborted', function(value) {
			console.info(`aborted... ${value}`);
		})
		.on('progress', function(value) {
			progressBar.detail = `Value ${value} out of 100%...`;
		});
	
    //win.loadURL('localhost:8000') 

});

app.on('before-quit', function () {
    child.kill()

});
app.on("window-all-closed", () => {
    child.kill()
    app.exit()
})