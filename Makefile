install:
	npm install
lint:
	npx eslint .
test:
	npm test
test-coverage:
	npm test -- --coverage
publish:
	npm publish --dry-run
build:
	rm -rf dist
	NODE_ENV=production npx webpack
develop:
	npx webpack serve
