var exec = require('child_process').exec,
    fs = require('fs'),
    chalk = require('chalk'),
    five = require('johnny-five'),
    board;

var isArduino = process.argv[2] === 'arduino';
var lastCapture = (new Date()).getTime();

if (isArduino) {
    board = new five.Board();
} else {
    var raspi = require('raspi-io');
    board = new five.Board({
        io: new raspi()
    });
}

board.on('ready', function () {

    var release = {
            focus : isArduino ? new five.Pin(2) : new five.Pin('GPIO5'),
            shutter : isArduino ? new five.Pin(3) : new five.Pin('GPIO6')
        };

    release.shutter.low();
    release.focus.low();

    // @obsolete
    function primeCamera (cb) {
        release.focus.high();

        board.wait(500, function () {
            release.focus.low();
        });

        board.wait(1000, function () {
            release.focus.high();
        });

        board.wait(1500, function () {
            release.focus.low();
            if (typeof cb === 'function') cb();
        });
    }

    function detect () {
        exec('gphoto2 --auto-detect', function (err, stdout, stderr) {
            if (err || stderr) {
                console.log(chalk.bgRed.bold('ERR'), chalk.red(err, stderr));
            } else {
                console.log(stdout);
            }
        });
    }

    function capture (download, callback) {
        var captureTime = (new Date()).getTime();

        exec('gphoto2 --capture-image' + (download ? '-and-download' : ''), function (err, stdout, stderr) {
            if (err || stderr) {
                console.log(err, stderr);
            } else {
                fs.rename('capt0000.jpg', './photos/' + captureTime + '.jpg', function (err) {
                    if (err) {
                        console.log(chalk.bgRed.bold('ERR'), chalk.red(err));
                        if (typeof callback === 'function') callback(err);
                    } else {
                        console.log('Image saved to ' + chalk.cyan('./photos/' + captureTime + '.jpg'));
                        if (typeof callback === 'function') callback(null, captureTime);
                    }
                });
            }
        });
    }

    function photobooth (iteration) {
        var timeout = 5000 - ((new Date()).getTime() - lastCapture);

        lastCapture = (new Date()).getTime();

        iteration = iteration || 0;

        if (iteration < 5) {
            setTimeout(function () {
                capture(true, photobooth.bind(this, iteration + 1));
            }.bind(this), (timeout < 0 ? 0 :  timeout));
        } else {
            console.log(chalk.green('Done photoboothing!'));
            fotomat();
        }
    }

    function fotomat () {
        fs.readdir('./photos', function (err, files) {

            if (err) {
                console.log(chalk.bgRed.bold('ERR'), chalk.red(err));
            } else {
                files = files.slice(-5);
                gifFactory(files);
            }
        });
    }

    function gifFactory (files) {

        exec('gm convert -delay 20 ' + './photos/' + files.join(' ./photos/') + ' animation.gif', function (err, stdout, stderr) {
            if (err || stderr) {
                console.log(chalk.bgRed.bold('ERR'), chalk.red(err, stderr));
            } else {
                console.log(chalk.green('Done fotomating!'));
            }
        });
    }

    //fotomat();

    // Cycle the focus every 10s so the camera
    // doesn't go to sleep.
    setInterval(function () {
        release.focus.high();

        board.wait(500, function () {
            release.focus.low();
        });
    }, 10000);

    this.repl.inject({
        release : release,
        detect : detect,
        capture : capture,
        photobooth : photobooth,
        fotomat : fotomat
    });

});
