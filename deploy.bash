#!/usr/bin/env bash
# This script deploys the app to Heroku
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd $DIR/
git remote add heroku https://git.heroku.com/ubermon.git
git remote add heroku.remote https://git.heroku.com/remote1-ubermon.git
git push heroku master
git push heroku.remote master

