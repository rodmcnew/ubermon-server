#!/usr/bin/env bash
# This script deploys the app to Heroku
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd $DIR/../deploy.ubermon
if [ $? -eq 0 ]; then
    rm -R ./*
    cp -R ../ubermon/* ./
    # Bring main .gitignore so node_modules don't go to Heroku
    cp ../ubermon/.gitignore ./
    # Ensure secrets.js makes it to Heroku
    rm ./secret/.gitignore
    git add .
    git commit -m "copy from other repo"
    git push heroku master
    cd $DIR
else
    echo deploy.ubermon folder does not exist
fi
