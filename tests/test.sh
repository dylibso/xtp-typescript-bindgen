set -e

# Make sure template is built
cd ../
./bundle.sh
cd tests

# Run through every schema in schemas/
for file in ./schemas/*.yaml; do
  echo "Generating and testing $file..."
  rm -rf output
  xtp plugin init --schema-file $file --template ../bundle --path output --name output -y --feature none
  cd output
  xtp plugin build
  cd ..
done
