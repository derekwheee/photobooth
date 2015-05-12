var spawn = require('child_process').spawn;
var os    = require('os');
var chalk = require('chalk');
var isPi  = os.platform() === 'linux' && os.arch() === 'arm';
var isOsx = os.platform() === 'darwin' && os.arch() === 'x64';
var rpiSpawn;
var gphotoSpawn;
var gmagickSpawn;

if (isPi) {
    console.log(chalk.bgMagenta('Installing raspi-io'));
    rpiSpawn = spawn('npm', ['install', 'raspi-io']);

    rpiSpawn.stdout.on('data', function (data) {
        console.log(data);
    });

    rpiSpawn.stderr.on('data', function (data) {
        console.log(chalk.bgRed('ERROR'), chalk.red(data));
    });

    rpiSpawn.on('close', function (code) {
        if (!code) {
            console.log(chalk.bgRed('ERROR'), chalk.red('raspi-io could not be installed.'));
        } else {
            console.log(chalk.bgGreen('SUCCESS'), chalk.green('raspi-io was successfully installed.'));
        }
        installGphoto();
    });

    function installGphoto () {
        console.log(chalk.bgMagenta('Installing gphoto2'));

        gphotoSpawn = spawn('sudo ./gphoto2-updater.sh');

        gphotoSpawn.stdout.on('data', function (data) {
            console.log(data);
        });

        gphotoSpawn.stderr.on('data', function (data) {
            console.log(chalk.bgRed('ERROR'), chalk.red(data));
        });

        gphotoSpawn.on('close', function (code) {
            if (!code) {
                console.log(chalk.bgRed('ERROR'), chalk.red('gphoto2 could not be installed.'));
            } else {
                console.log(chalk.bgGreen('SUCCESS'), chalk.green('gphoto2 was successfully installed.'));
            }
            installGmagick();
        });
    }

    function installGmagick () {
        console.log(chalk.bgMagenta('Installing graphicsmagick'));

        gmagickSpawn = spawn('sudo apt-get graphicsmagick');

        gmagickSpawn.stdout.on('data', function (data) {
            console.log(data);
        });

        gmagickSpawn.stderr.on('data', function (data) {
            console.log(chalk.bgRed('ERROR'), chalk.red(data));
        });

        gmagickSpawn.on('close', function (code) {
            if (!code) {
                console.log(chalk.bgRed('ERROR'), chalk.red('graphicsmagick could not be installed.'));
            } else {
                console.log(chalk.bgGreen('SUCCESS'), chalk.green('graphicsmagick was successfully installed.'));
                console.log(chalk.bgGreen('DONE'), chalk.green('Dependencies successfully installed.'));
            }
        });
    }


}

if (isOsx) {
    console.log(chalk.bgMagenta('Installing gphoto2'));

    gphotoSpawn = spawn('brew', ['install', 'gphoto2']);

    gphotoSpawn.stdout.on('data', function (data) {
        console.log(data);
    });

    gphotoSpawn.stderr.on('data', function (data) {
        console.log(chalk.bgRed('ERROR'), chalk.red(data));
    });

    gphotoSpawn.on('close', function (code) {
        if (!code) {
            console.log(chalk.bgRed('ERROR'), chalk.red('gphoto2 could not be installed.'));
        } else {
            console.log(chalk.bgGreen('SUCCESS'), chalk.green('gphoto2 was successfully installed.'));
        }
        installGmagick();
    });

    function installGmagick () {
        console.log(chalk.bgMagenta('Installing graphicsmagick'));

        gmagickSpawn = spawn('brew', ['install', 'graphicsmagick']);

        gmagickSpawn.stdout.on('data', function (data) {
            console.log(data);
        });

        gmagickSpawn.stderr.on('data', function (data) {
            console.log(chalk.bgRed('ERROR'), chalk.red(data));
        });

        gmagickSpawn.on('close', function (code) {
            if (!code) {
                console.log(chalk.bgRed('ERROR'), chalk.red('graphicsmagick could not be installed.'));
            } else {
                console.log(chalk.bgGreen('SUCCESS'), chalk.green('graphicsmagick was successfully installed.'));
                console.log(chalk.bgGreen('DONE'), chalk.green('Dependencies successfully installed.'));
            }
        });
    }
}
