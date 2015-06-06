# photobooth

## Requirements

photobooth is a Node application. It has been tested with Node 0.10.x and 0.12.x.

### OS X

OS X requires [Homebrew](http://brew.sh/) to install gphoto2 and GraphicsMagick. Once you have Homebrew installed run:
```
brew update
npm install
```
This will install all required Node packages and Homebrew packages.

### Raspberry Pi

Installation on the Raspberry Pi requires `apt-get` which you likely have already. Install dependencies with:
```
apt-get update
npm install
```

### Environment
Create a `.env` file in the root of the project and add your MongoDB URI:
```
MONGOLAB_URI=mongodb://<user>:<password>@path.to/mongodb
```

Create a file at `~/.aws/credentials` with your AWS key and secret
```
[default]
aws_access_key_id = ACCESSKEY
aws_secret_access_key = SECRETACCESSKEY
```
