require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const githubTools = require('../util/index.js');
const app = express();
const axios = require('axios');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('you\'re home').status(200);
});


app.post('/api/github/clonerepo', (req, res) => {
  let { username, repoName, gitUrl } = req.body;
  
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


app.post('/api/github/gists/get', (req, res) => {
  let { username, accessToken } = req.body;
  let url = `https://api.github.com/users/${username}/gists`;
  let gists = [];

  let config = {
    headers: { 'User-Agent': 'athesio' },
    params: { access_token: accessToken }
  }

  axios.get(url, config)
    .then( ({ data }) => {
      data.forEach(gist => {
        console.log('gist: ', gist);
        let { id, description, html_url } = gist;
        let fileName = Object.keys(gist.files);
        let language = gist.files[fileName].language;
        description = description === null ? '' : description;
        let gistObj = { id: id, description: description, fileName: fileName, url: html_url,  language: language };
        if (language.toLowerCase() === 'javascript') gists.push(gistObj);
        console.log('gist: ', gistObj);
      });
    
    res.send(gists);
    })
    .catch(console.log);
});


app.post('/api/github/gists/get-single/', (req, res) => {
  let { accessToken, id } = req.body;
  let url = `https://api.github.com/gists/${id}`;

  let config = {
    headers: { 'User-Agent': 'athesio' },
    params: { access_token: accessToken }
  }

  axios.get(url, config)
    .then( ({ data }) => {
        let gist = data;
        let { id, description, html_url } = gist;
        let fileName = Object.keys(gist.files);
        let language = gist.files[fileName].language;
        description = description === null ? '' : description;
        let gistObj = { id: id, description: description, fileName: fileName, url: html_url,  language: language };
        if (language.toLowerCase() === 'javascript') res.send(gistObj);
        else res.send({});
    })
    .catch(console.log);
});


app.post('/api/github/gists/update', (req, res) => {
  let { id, accessToken, description, fileName, content } = req.body;
  id = 'ab9c3c3fc2f8a819693fb8a67ecdd97a';
  accessToken = '5fbdfdf1338c3d7b7f38155dfc8275fd6fbafec4';
  fileName = 'index.js';
  content = 'console.log(`update worked fine`);';
  let url = `https://api.github.com/gists/${id}`;
  
  let fileObj = {};
  fileObj[fileName] = { content: content };

  let config = {
    headers: { 
      'User-Agent': 'athesio',
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    data: { description: description, public: true, files: fileObj }
  };

  axios.patch(url, config.data, { headers: config.headers })
    .then( ({ data }) => {
      console.log('after successful post: ', data);
      res.send('successfully updated gist').status(200);
    })
    .catch(console.log)
});


app.post('/api/github/gists/create', (req, res) => {
  let { accessToken, description, fileName, content } = req.body;
  
  let url = `https://api.github.com/gists`;
  let fileObj = {};
  fileObj[fileName] = { content: content };

  let config = {
    headers: { 
      'User-Agent': 'athesio',
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    data: { description: description, public: true, files: fileObj }
  }

  axios.post(url, config.data, { headers: config.headers })
    .then( ({ data }) => {
      console.log('after successful post: ', data);
      res.send('successfully created gist').status(200);
    })
    .catch(console.log)
});


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port: ${port}`));
