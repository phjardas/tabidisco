#!/bin/bash -e

cd $(dirname $0)

yarn --offline --frozen-lockfile
yarn --offline clean
yarn --offline build

sudo service tabidisco restart
