gulp-jspm-local
===
[![NPM version][npm-image]][npm-url] 

A gulp task for updating you local dependencies installed by [jspm-local](https://github.com/Netatwork-de/jspm-local) endpoint.

## Installation

Install `gulp-jspm-local` using npm into your global or local repository.

```bash
npm install -g jspm-local
# or locally
npm install jspm-local --save-dev
```
## Usage

Setup a gulp task `update-own-deps` and execute `updateLocalDependencies()`.

```js
var gulp = require('gulp');
var tools = require('gulp-jspm-local');

// updates dependencies in this folder
// from folders in the parent directory
gulp.task('update-own-deps', function() {
  return tools.updateLocalDependencies();
});
```

## License

[Apache 2.0](/license.txt)

[npm-url]: https://npmjs.org/package/gulp-jspm-local
[npm-image]: http://img.shields.io/npm/v/gulp-jspm-local.svg