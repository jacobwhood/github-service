const fs = require('fs');
const glob = require('glob');
const { spawn } = require('child_process');

module.exports.MakeDirForUser = (username, repoName) => {
  if (!fs.existsSync(`./${username}`)) {
    fs.mkdirSync(`./${username}`);
  }
};

module.exports.CloneUserRepo = (username, gitUrl) => {
  
};

module.exports.RetrieveRepoDirectoryStructure = (username, repoName) => {

};
