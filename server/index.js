require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('im here').status(200);
});

app.post('/api/github/clonerepo', (req, res) => {
  let { username, repoName, gitUrl } = req.body;



  res.send(`repo name passed in: ${repoName} for this url: ${gitUrl}`).status(200);  
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port: ${port}`));
