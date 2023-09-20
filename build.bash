rm -rf lib
rm -rf dist
echo 'tsc...'
tsc --project ./tsconfig.json
echo 'browserify...'
browserify ./lib/index.js --standalone ECRHub -o dist/index.js
cp src/browser.d.ts lib/browser.d.ts
echo 'dts bundling...'
./node_modules/.bin/dts-bundle-generator lib/index.d.ts -o dist/index.d.ts --no-banner
./node_modules/.bin/dts-bundle-generator lib/browser.d.ts -o dist/index.browser.d.ts --no-banner --inline-declare-global
echo 'Build complete!'
