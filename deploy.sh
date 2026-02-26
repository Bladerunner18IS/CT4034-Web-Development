#!/bin/zsh
cd /var/www/html

source .env

npm run build

mkdir build/public
mv build/* build/public/
mv build/.htaccess build/public/

cp -r public/api build/public/

cp composer.* build/

mkdir -p build/src/exceptions
cp src/*.php src/.htaccess build/src/
cp src/exceptions/* build/src/exceptions/

rsync -r -e "ssh -i $SSH_KEY_PATH" "build/" "$SERVER_USER@$SERVER_ADDRESS:$SERVER_PATH"