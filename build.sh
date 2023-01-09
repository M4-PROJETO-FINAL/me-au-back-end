#!/usr/bin/env bash
# exit on error
set -o errexit

npm i --save-dev @types/jest
yarn
yarn build
yarn typeorm migration:run -d dist/src/data-source
