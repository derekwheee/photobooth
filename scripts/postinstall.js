var exec = require('child_process').exec;
var os = require('os');
var chalk = require('chalk');
var isPi = os.platform() === 'linux' && os.arch() === 'arm';
var isOsx = os.platform() === 'darwin' && os.arch() === 'x64';

if (isPi) {
    console.log(chalk.bgMagenta('Installing raspi-io'));
    exec('npm install raspi-io', function (err, stdout, stderr) {
        if (err) {
            console.log(chalk.bgRed('ERROR'), chalk.red('raspi-io could not be installed.'));
        } else {
            console.log(chalk.bgGreen('SUCCESS'), chalk.green('raspi-io was successfully installed.'))
        }
        console.log(chalk.bgMagenta('Installing gphoto2'));
        exec('sudo ./gphoto2-updater.sh', function (err, stdout, stderr) {
            if (err) {
                console.log(chalk.bgRed('ERROR'), chalk.red('gphoto2 could not be installed.'));
            } else {
                console.log(chalk.bgGreen('SUCCESS'), chalk.green('gphoto2 was successfully installed.'))
            }
            console.log(chalk.bgMagenta('Installing GraphicsMagick'));
            exec('sudo apt-get graphicsmagick', function (err, stdout, stderr) {
                if (err) {
                    console.log(chalk.bgRed('ERROR'), chalk.red('GraphicsMagick could not be installed.'));
                } else {
                    console.log(chalk.bgGreen('SUCCESS'), chalk.green('GraphicsMagick was successfully installed.'))
                }
            });
        });
    });
}

if (isOsx) {
    console.log(chalk.bgMagenta('Installing gphoto2'));
    exec('brew install gphoto2', function (err, stdout, stderr) {
        if (err) {
            console.log(chalk.bgRed('ERROR'), chalk.red('gphoto2 could not be installed.'));
        } else {
            console.log(chalk.bgGreen('SUCCESS'), chalk.green('gphoto2 was successfully installed.'))
        }
        console.log(chalk.bgMagenta('Installing GraphicsMagick'));
        exec('brew install graphicsmagick', function (err, stdout, stderr) {
            if (err) {
                console.log(chalk.bgRed('ERROR'), chalk.red('GraphicsMagick could not be installed'));
            } else {
                console.log(chalk.bgGreen('SUCCESS'), chalk.green('GraphicsMagick was successfully installed.'))
            }
        });
    });
}
