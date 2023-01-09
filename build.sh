#!/usr/bin/env bash
# exit on error
set -o errexit

yarn
yarn add --save-dev jest
yarn build
yarn typeorm migration:run -d dist/src/data-source
