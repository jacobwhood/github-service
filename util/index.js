const fs = require('fs');
const glob = require('glob');
const { spawn } = require('child_process');
const path = require('path');

// helpers to get and format file structure object
const flatten = arr => arr.reduce((acc, val) =>
  acc.concat(Array.isArray(val) ? flatten(val) : val), []);

Array.prototype.flatten = function () {
  return flatten(this)
};

const walkSync = dir => fs.readdirSync(dir)
  .map(file => fs.statSync(path.join(dir, file)).isDirectory() ?
    walkSync(path.join(dir, file)) :
    path.join(dir, file).replace(/\\/g, '/')).flatten();

const Treeify = (files) => {
  var fileTree = {};

  if (files instanceof Array === false) {
    throw new Error('Expected an Array of file paths, but saw ' + files);
  }

  function mergePathsIntoFileTree(prevDir, currDir, i, filePath) {

    if (i === filePath.length - 1) {
      prevDir[currDir] = filePath.join('/');
    }

    if (!prevDir.hasOwnProperty(currDir)) {
      prevDir[currDir] = {};
    }

    return prevDir[currDir];
  }

  function parseFilePath(filePath) {
    var fileLocation = filePath.split('/');

    // If file is in root directory, eg 'index.js'
    if (fileLocation.length === 1) {
      return (fileTree[fileLocation[0]] = 'file');
    }

    fileLocation.reduce(mergePathsIntoFileTree, fileTree);
  }

  files.forEach(parseFilePath);

  return fileTree;
}


module.exports.UserRepoHasBeenCloned = (username, repoName) => {
  return fs.existsSync(`./repos/${username}/${repoName}`);
};

module.exports.MakeDirForUser = (username, repoName) => {
  if (!fs.existsSync(`./repos/${username}`)) {
    fs.mkdirSync(`./repos/${username}`);
  }
};

module.exports.CloneUserRepo = (username, repoName, gitUrl, cb) => {
  if (!this.UserRepoHasBeenCloned(username, repoName)) {
    const child = spawn(`git clone`, [gitUrl, `./repos/${username}/${repoName}`], {
      shell: true
    });
    child.stdout.on('data', (data) => {
      console.log(`stdout output: ${data}`);
    });

    child.stderr.on('data', (err) => {
      console.log(`stderr output: ${err}`);
    });

    child.on('close', (code) => {
      console.log(`exit code: ${code}`);
      cb(username, repoName);
    });
  }
};

module.exports.RetrieveRepoDirectoryStructure = (username, repoName, cb) => {
  if (this.UserRepoHasBeenCloned(username, repoName)) {
    console.log(`looking in this directory: ./repos/${username}/${repoName}`);
    let fileArray = walkSync(`./repos/${username}/${repoName}`).filter(path => !path.includes('.git/') && !path.includes('node_modules'));
    let filteredFileObj = JSON.stringify(Treeify(fileArray));
    cb({ fileDirectory: filteredFileObj, fileArray: fileArray });
  } else {
    console.log('indicates repo has not been cloned');
    cb([]);
  }
};

module.exports.ReadFileIntoMemory = (username, repoName, filePath, cb) => {
  if (this.UserRepoHasBeenCloned(username, repoName)) {
    let file = '';
    fs.readFile(filePath, (err, contents) => {
      if (err) {
        console.log(`error reading file contents at path: ${filePath}`, err);
        cb(err, null);
      } else {
        cb(null, contents.toString());
      }
    });
  } else {
    console.log(`required repo: ${repoName} for file: ${filePath} has not been cloned.`);
    cb(null, null);
  }
};
