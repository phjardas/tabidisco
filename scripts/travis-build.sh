#!/bin/bash
cd $(dirname $0)/..

TIMESTAMP=$(date -u --iso-8601=seconds)

COMMIT=$TRAVIS_COMMIT
: ${COMMIT:=$(git rev-parse --short HEAD)}

BRANCH=$TRAVIS_PULL_REQUEST_BRANCH
[ -z "$BRANCH" ] && BRANCH=$TRAVIS_BRANCH
: ${BRANCH:=$(git rev-parse --abbrev-ref HEAD)}

VERSION=$(node -p "require('./package.json').version")

echo "TIMESTAMP: $TIMESTAMP"
echo "COMMIT: $COMMIT"
echo "BRANCH: $BRANCH"
echo "VERSION: $VERSION"

JSON="{ \"timestamp\": \"${TIMESTAMP}\", \"version\": \"${VERSION}\", \"branch\": \"${BRANCH}\", \"commit\": \"${COMMIT}\" }"
echo "$JSON" > server/build-info.json

npm run test:ci
npm run build
npm run fixme
# docker build --tag phjardas/tabidisco .
