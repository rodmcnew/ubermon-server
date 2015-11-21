#!/usr/bin/env bash
# This script deploys the app to Heroku
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd $DIR/../deploy.ubermon
if [ $? -eq 0 ]; then
    rm -R ./*
    cp -R ../ubermon/* ./
    # Bring main .gitignore so node_modules don't go to Heroku
    cp ../ubermon/.gitignore ./
    git add .
    git commit -m "copy from main repo"
    git push heroku master -f
    git push heroku.remote master -f
    cd $DIR
else
    echo deploy.ubermon folder does not exist
fi
