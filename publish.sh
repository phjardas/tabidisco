#!/bin/bash -e
npm install
npm run build
node bundle.js
(cd npm && npm publish)
