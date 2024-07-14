set -e

cd ../
./bundle.sh
cd tests



for file in ./schemas/*.yaml; do
  echo "Generating and testing $file..."
  rm -rf output
  xtp plugin init --schema-file $file --template ../bundle --path output -y
  cd output
  xtp plugin build
  cd ..
done


