#!/usr/bin/env bash
# This script deploys the app to Heroku
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd $DIR/../deploy.ubermon
if [ $? -eq 0 ]; then
    rm -R ./*
    cp -R ../ubermon-uptime-monitor/* ./
    # Bring main .gitignore so node_modules don't go to Heroku
    cp ../ubermon-uptime-monitor/.gitignore ./
    git add .
    git commit -m "copy from main repo"
    git push heroku master
    git push heroku.remote master
    cd $DIR
else
    echo deploy.ubermon folder does not exist
fi
