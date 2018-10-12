require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const githubTools = require('../util/index.js');
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('im here').status(200);
});

app.post('/api/github/clonerepo', (req, res) => {
  let { username, repoName, gitUrl } = req.body;
  // makedirectory for user
  // clone new repo
  // retrieve the directory structure
  githubTools.MakeDirForUser(username, repoName);

  if (githubTools.UserRepoHasBeenCloned(username, repoName)) {
    githubTools.RetrieveRepoDirectoryStructure(username, repoName, (fileStructure) => {
      console.log('file structure of repo: ', fileStructure);
      res.send(fileStructure);
    });
  } else {
    githubTools.CloneUserRepo(username, repoName, gitUrl, (username, repoName) => {
      githubTools.RetrieveRepoDirectoryStructure(username, repoName, (fileStructure) => {
        console.log('file structure of repo: ', fileStructure);
        res.send(fileStructure);
      });
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port: ${port}`));
