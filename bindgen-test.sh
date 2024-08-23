#!/usr/bin/env bash
set -e

TEST_DIR=bindgen-test-artifacts
mkdir -p $TEST_DIR

case $1 in
  "install")
    # get the latest release
    RELEASE_URL="https://api.github.com/repos/dylibso/xtp-bindgen-test/releases/latest"
    ASSET_URL=$(curl -s $RELEASE_URL | jq '.assets[0].browser_download_url' | tr -d \")
    if [ -z "$ASSET_URL" ]; then
      echo "Asset URL not found. Please check the asset name or the repository."
      exit 1
    fi
    echo "changing into '$TEST_DIR'..."
    cd $TEST_DIR

    # download and unzip the bundle
    echo "downloading bundle.zip from '$ASSET_URL'..."
    curl -L -o bundle.zip $ASSET_URL
    unzip bundle.zip
  ;;

  "run")
    echo "changing into '$TEST_DIR/bundle/'..."
    cd $TEST_DIR/bundle/

    # Using ../../bundle so we test the bindgen template
    PLUGIN_NAME=exampleplugin
    echo "generating initial plugin code in '$(pwd)/$PLUGIN_NAME'..."
    xtp plugin init --schema-file schema.yaml --template ../../bundle --path $PLUGIN_NAME --name $PLUGIN_NAME --feature stub-with-code-samples
    echo "building '$PLUGIN_NAME'..."
    xtp plugin build --path $PLUGIN_NAME
    echo "testing '$PLUGIN_NAME'..."
    xtp plugin test $PLUGIN_NAME/dist/plugin.wasm --with test.wasm --mock-host mock.wasm
  ;;
esac