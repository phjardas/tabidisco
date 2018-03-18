#!/bin/bash -e
node bundle.js
(cd npm && npm publish)
