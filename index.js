var exec  = require('child_process').exec;
var fs    = require('fs');
var chalk = require('chalk');
var five  = require('johnny-five');
var AWS   = require('aws-sdk');
var mongoose = require('mongoose')
var board;
var db;
var Gif;

// Load environment variables
require('dotenv').load();

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

mongoose.connect(process.env.MONGOLAB_URI);

db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {

    var gifSchema = mongoose.Schema({
        paths: {
            preview: String,
            high_resolution: String
        },
        hearts: Number
    });

    Gif = mongoose.model('gifs', gifSchema);

});

board.on('ready', function () {

    var release = {
            focus : isArduino ? new five.Pin(12) : new five.Pin('GPIO5'),
            shutter : isArduino ? new five.Pin(13) : new five.Pin('GPIO6')
        };

    release.shutter.low();
    release.focus.low();

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
                console.log(chalk.bgRed.bold('ERR'), chalk.red('[capture] ' + err, stderr));
                if (typeof callback === 'function') callback(err);
            } else {
                if (download) {
                    fs.rename('capt0000.jpg', './photos/' + captureTime + '.jpg', function (err) {
                        if (err) {
                            console.log(chalk.bgRed.bold('ERR'), chalk.red('[rename] ' + err));
                            if (typeof callback === 'function') callback(err);
                        } else {
                            console.log('Image saved to ' + chalk.cyan('./photos/' + captureTime + '.jpg'));
                            if (typeof callback === 'function') callback(null, captureTime);
                        }
                    });
                } else {
                    console.log(chalk.green.bold('[capture]'), chalk.green('Image captured'));
                }
            }
        });
    }

    function photobooth (iteration, err, captureTime) {
        var timeout = 5000 - ((new Date()).getTime() - lastCapture);

        lastCapture = (new Date()).getTime();

        iteration = iteration || 0;

        if (iteration < 5) {
            setTimeout(function () {
                capture(true, photobooth.bind(this, (err ? iteration : iteration + 1)));
            }.bind(this), (timeout < 0 ? 0 :  timeout));
        } else {
            console.log(chalk.green('Done photoboothing!'));
            fotomat();
        }
    }

    function fotomat () {
        fs.readdir('./photos', function (err, files) {
            if (err) {
                console.log(chalk.bgRed.bold('ERR'), chalk.red('[fotomat] ' + err));
            } else {
                files = files.slice(-5);
                gifFactory(files);
            }
        });
    }

    function gifFactory (files) {
        var filename = 'animation-' + Date.now() + '.gif';

        cropPhotos(files, function () {
            exec('gm convert -delay 20 ' + './tmp/' + files.join(' ./tmp/') + ' ./gifs/' + filename, function (err, stdout, stderr) {
                if (err || stderr) {
                    console.log(chalk.bgRed.bold('ERR'), chalk.red(err, stderr));
                } else {
                    console.log(chalk.green('Done fotomating!'));
                    uploadGif(filename)
                }
            });
        });
    }

    function cropPhotos (files, callback) {
        var cropped = 0;

        files.forEach(function (file) {
            exec('gm convert ./photos/' + file + ' -crop "480x480!+120+0" ./tmp/' + file, function (err, stdout, stderr) {
                if (err || stderr) {
                    console.log(chalk.bgRed.bold('ERR'), chalk.red('[crop]', err));
                } else {
                    cropped++;
                    if (cropped === 5) {
                        grayscalePhotos(files, callback);
                    }
                }
            });
        });
    }

    function grayscalePhotos (files, callback) {
        var grayed = 0;

        files.forEach(function (file) {
            exec('gm mogrify -type grayscale -contrast ./tmp/' + file, function (err, stdout, stderr) {
                if (err || stderr) {
                    console.log(chalk.bgRed.bold('ERR'), chalk.red('[grayscale]', err));
                } else {
                    grayed++;
                    if (grayed === 5 && typeof callback === 'function') {
                        callback();
                    }
                }
            });
        });
    }

    function uploadGif (filename) {
        var s3 = new AWS.S3();

        var params = {Bucket: 'fotomat', Key: filename, Body: fs.readFileSync('./gifs/' + filename)};

        s3.upload(params, null, function(err, data) {
            if (err) {
                console.log(chalk.bgRed.bold('ERR'), chalk.red('[upload]', err));
            } else {
                console.log(chalk.green('Done uploading!'));
                saveToDb(data.Location)
            }
        });
    }

    function saveToDb(location) {
        var gif = new Gif({
            paths: {
                preview: location,
                high_resolution: location
            },
            hearts: 0
        });

        gif.save(function (err, gif) {
            if (err) {
                console.log(chalk.bgRed.bold('ERR'), chalk.red('[db]', err));
            } else {
                console.log(chalk.green('Done saving to DB!'));
                fileCleanup();
            }
        });
    }

    function fileCleanup () {
        var removeFiles = function (dir) {
            try {
                var files = fs.readdirSync(dir);
            }
            catch(err) {
                console.log(chalk.bgRed.bold('ERR'), chalk.red('[cleanup]', err));
            }

            if (files.length > 0) {
                for (var i = 0; i < files.length; i++) {
                    var filePath = dir + '/' + files[i];
                    if (fs.statSync(filePath).isFile()) {
                        fs.unlinkSync(filePath);
                    }
                }
            }
        }

        removeFiles('./tmp');
        removeFiles('./gifs');

        console.log(chalk.green('Done cleaning up files!'));
    }

    // Cycle the focus every 10s so the camera
    // doesn't go to sleep.
    setInterval(function () {
        release.focus.high();

        board.wait(500, function () {
            release.focus.low();
        });
    }, 10000);

    this.repl.inject({
        release     : release,
        detect      : detect,
        capture     : capture,
        photobooth  : photobooth,
        fotomat     : fotomat
    });

});
