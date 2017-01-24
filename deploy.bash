#!/usr/bin/env bash
# This script deploys the app to Heroku
git remote add production https://git.heroku.com/ubermon.git
git remote add productionremote https://git.heroku.com/remote1-ubermon.git
git add . && git commit -m "add build files"
git push origin master
git push production master
#git push productionremote master
