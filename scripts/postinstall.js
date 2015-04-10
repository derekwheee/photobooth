var exec = require('child_process').exec;
var os = require('os');
var chalk = require('chalk');
var isPi = os.platform() === 'linux' && os.arch() === 'arm';

if (isPi) {
    console.log(chalk.bgMagenta('Installing raspi-io...'));
    exec('npm install raspi-io');
} else {
    console.log(chalk.bgMagenta('Not a Raspberry Pi. Done installing packages.'));
}
