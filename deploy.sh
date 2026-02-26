#!/bin/zsh
cd /var/www/html

source .env

npm run build

mkdir build/public
mv build/* build/public/

cp -r public/api build/public/

cp composer.* build/

mkdir build/src
cp src/*.php src/Exceptions/* src/.htaccess build/src/

rsync -r -e "ssh -i $SSH_KEY_PATH" "build/" "$SERVER_USER@$SERVER_ADDRESS:$SERVER_PATH"