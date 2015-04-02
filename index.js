var raspi = require('raspi-io'),
    exec = require('child_process').exec,
    fs = require('fs'),
    five = require('johnny-five'),
    board = new five.Board({
        io: new raspi()
    });

board.on('ready', function () {

    var release = {
            focus : new five.Pin('GPIO5'),
            shutter : new five.Pin('GPIO6')
        };

    release.shutter.low();
    release.focus.low();

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
        primeCamera(function () {
            exec('gphoto2 --auto-detect', function (err, stdout, stderr) {
                if (err || stderr) {
                    console.log('An error occurred');
                } else {
                    console.log(stdout);
                }
            });
        });
    }

    function capture (download) {
        primeCamera(function () {
            exec('gphoto2 --capture-image' + (download ? '-and-download' : ''), function (err, stdout, stderr) {
                if (err || stderr) {
                    console.log('An error occurred');
                } else {
                    console.log(stdout);
                    fs.rename('capt0000.jpg', './photos/' + (new Date()).getTime() + '.jpg'); 
                }
            });
        });
    }

    function photobooth () {
        capture(true);

        board.wait(5000, function () {
            capture(true);
        });

        board.wait(10000, function () {
            capture(true);
        });
    }

    this.repl.inject({
        release : release,
        detect : detect,
        capture : capture,
        photobooth : photobooth
    });

});
