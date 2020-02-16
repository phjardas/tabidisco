#!/bin/bash -e

cd $(dirname $0)

yarn --immutable --immutable-cache --inline-builds
yarn clean
REACT_APP_GRAPHQL_ENDPOINT=/graphql yarn build

sudo service tabidisco restart
