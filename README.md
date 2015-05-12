# photobooth

## Getting Started

### OS X

Install gphoto2 with Homebrew:
```
brew install gphoto2
```

### Linux

Use the include install script to install gphoto2 and its dependencies:
```
sudo ./gphoto2-updater.sh
```

### Environment
Create a `.env` file in the root of them project and your MongoDB URI:
```
MONGOLAB_URI=mongodb://<user>:<password>@path.to/mongodb
```

Create a file at `~/.aws/credentials` with you AWS key and secret
```
[default]
aws_access_key_id = ACCESSKEY
aws_secret_access_key = SECRETACCESSKEY
```
