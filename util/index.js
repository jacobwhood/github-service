const fs = require('fs');
const glob = require('glob');
const { spawn } = require('child_process');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  return fs.readdirSync(dir)
    .map(file => fs.statSync(path.join(dir, file)).isDirectory() ?
      walkSync(path.join(dir, file), filelist) :
      filelist.concat(path.join(dir, file))[0])
};

module.exports.filterDirectory = (fileDir, repoName) => {
  const resultArr = [];

  const traverse = (arr) => {
    if (arr.length === 0) {
      return;
    } else {
      for (let i = 0; i < arr.length; i++) {
        if (Array.isArray(arr[i])) {
          traverse(arr[i]);
        } else {
          if (!arr[i].includes('/.git/')) {
            // console.log(arr[i]);
            //arr.splice(i, 1);
            resultArr.push(arr[i]);
          }
        }
      }
    }
  };
  traverse(fileDir);
  console.log(resultArr);

  const result = {};
  result[repoName] = {};
  const repoObj = result[repoName];
  resultArr.forEach(element => {
    const elArr = element.split(`${repoName}/`);
    // console.log(elArr[1]);
    const temp = elArr[1].split('/');
    const file = temp[temp.length - 1];
    if (temp.length === 1) {
      repoObj[file] = `${repoName}/${file}`;
    } else {
      let currentFolder = repoObj;
      for (let i = 0; i < temp.length - 1; i++) {
        if (!currentFolder[temp[i]]) {
          currentFolder[temp[i]] = {};
        }
        currentFolder = currentFolder[temp[i]];
      }
      currentFolder[file]
    }
    
    
    console.log(elArr[1].split('/'));

  });

  

  return resultArr;
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
    cb(walkSync(`./repos/${username}/${repoName}`));
    // glob(`./repos/${username}/${repoName}`, (err, result) => {
    //   if (err) {
    //     console.log('error retrieving file structure: ', err);
    //     cb([]);
    //   } else {
    //     console.log('successfully retrieved file structure: ', result);
    //     cb(result);
    //   }
    // });
  } else {
    console.log('indicates repo has not been cloned');
    cb([]);
  }
};
