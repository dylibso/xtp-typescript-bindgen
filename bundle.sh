#!/usr/bin/env bash
set -e

npm run build

rm -rf bundle
mkdir bundle
cp -R template/ bundle/template
cp dist/plugin.wasm bundle
cp config.yaml bundle

zip -r bundle.zip bundle/
