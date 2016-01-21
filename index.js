// Copyright 2016 Net at Work GmbH
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var Promise = require('rsvp').Promise;
var asp = require('rsvp').denodeify;
var fs = require('graceful-fs');
var path = require('path');
var gutil = require('gulp-util');

var dependencyPath = 'jspm_packages/local';

function getPackageObject(repo) {
	var packageFile = path.resolve('..', repo + '/package.json');

	return asp(fs.readFile)(packageFile)
		.then(function(lookupJSON) {
			return JSON.parse(lookupJSON.toString());
		})
		.catch(function(e) {
			if (e.code == 'ENOENT' || e instanceof SyntaxError)
				return { notfound: true };
			throw e;
		});
}

function copyFiles(src, dest) {
	return asp(fs.access)(dest, fs.F_OK)
		.catch(function() {
			fs.mkdirSync(dest);
		})
		.then(function() {
			return asp(fs.readdir)(src);
		})
		.then(function (filePaths) {
			var tasks = filePaths.filter(function (fileName) {
				return fileName.indexOf("jspm_packages") <= -1
					&& fileName.indexOf("node_modules") <= -1;
				})
				.map(function (fileName) {
					var filePath = path.resolve(src, fileName);
					var outFilePath = path.resolve(dest, fileName);
					var isDirectory = fs.lstatSync(filePath).isDirectory();

					if (isDirectory) {
						return copyFiles(filePath, outFilePath);
					} else {
						return asp(fs.readFile)(filePath)
							.then(function(fileContent) {
								fs.writeFileSync(outFilePath, fileContent);
								return Promise.resolve();
							});
					}
				});
			return Promise.all(tasks);
		});
}

function syncProject(path) {
	var index = path.indexOf('@');
	if (index != -1) {
    	var packageName = path.substring(0, index);
	}
	else {
		packageName = path;
	}
    gutil.log("Updating package", gutil.colors.yellow(packageName));

    return getPackageObject(packageName)
    .then(function(project) {
        var projectPath = '../' + packageName;

        var files = []
        if(project.files !== undefined && project.files.length == 0){
            gutil.log("\t",project.files.length, "file(s) defined.");
            files = project.files;
        }
        else {
            gutil.log("\tNo files defined in package.json. All files will be included.");
        }

        if(project.directories.lib !== undefined){
            gutil.log("\tLib path '" + project.directories.lib + "' found.");
            projectPath += '/' + project.directories.lib;
        }
        else {
            gutil.log("\tNo lib path found. Loading from root.");
        }

        return copyFiles(projectPath,path);
    });

}

function isDirectory(fileName) {
    var filePath = path.resolve(dependencyPath, fileName);
    return fs.lstatSync(filePath).isDirectory();
}

function updateLocalDependencies(projects) {
	if (projects !== undefined) {
		return Promise.all(projects.map(syncProject));
	}
    return asp(fs.readdir)(dependencyPath)
        .then(function(files) {
            return Promise.all(files.filter(isDirectory).map(syncProject));
        });
}

module.exports = {
    updateLocalDependencies: updateLocalDependencies
};
