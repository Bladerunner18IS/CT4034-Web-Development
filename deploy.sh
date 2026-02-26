#!/bin/zsh
cd /var/www/html

source .env

npm run build

mkdir build/public
mv build/* build/public/ 2> /dev/null #Silently fails to move /public into itself.
mv build/.htaccess build/public/

cp -r public/api build/public/

cp composer.* build/

mkdir -p build/src/exceptions
cp src/*.php src/.htaccess build/src/
cp src/exceptions/* build/src/exceptions/


read -q "push?Push new build to the remote server? [y/N] "

if [[ $push =~ ^[yY]$ ]]
then
    rsync -v --stats --progress -r -e "ssh -i $SSH_KEY_PATH" "build/" "$SERVER_USER@$SERVER_ADDRESS:$SERVER_PATH"
    printf "\nComplete"
else
    printf "\nBuild created."
fi