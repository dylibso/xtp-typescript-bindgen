set -e

./bundle.sh

rm -rf output
xtp plugin init --schema-file test-schema.yaml --template bundle --path output -y
cd output
xtp plugin build
