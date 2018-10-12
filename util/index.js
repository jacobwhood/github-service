const fs = require('fs');
const glob = require('glob');
const { spawn } = require('child_process');

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
  console.log('cb: ', cb);
  if (this.UserRepoHasBeenCloned(username, repoName)) {
    console.log(`looking in this directory: ./repos/${username}/${repoName}`);
    glob(`./repos/${username}/${repoName}`, (err, result) => {
      if (err) {
        console.log('error retrieving file structure: ', err);
        cb([]);
      } else {
        console.log('successfully retrieved file structure: ', result);
        cb(result);
      }
    });
  } else {
    console.log('indicates repo has not been cloned');
    cb([]);
  }
};
