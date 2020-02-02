#!/bin/bash -e

cd $(dirname $0)

yarn --immutable --immutable-cache --inline-builds
yarn clean
yarn build

sudo service tabidisco restart
