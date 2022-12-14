require('dotenv').config('.env');
const cors = require('cors');
const express = require('express');
const app = express();
const morgan = require('morgan');
const { PORT = 3000 } = process.env;
// TODO - require express-openid-connect and destructure auth from it
const { auth, requiresAuth } = require('express-openid-connect');

const { User, Cupcake } = require('./db');

// middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

  const {secret ,  base, client, issuer} = process.env
  const config = {
    authRequired: false,
    auth0Logout: true,
    secret: secret,
    baseURL: base,
    clientID: client,
    issuerBaseURL: issuer
  };

  app.use(auth(config));

  app.get('/', (req, res) => {
    // res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
    res.send(req.oidc.isAuthenticated() ? `<h1 style='text-align:center'>Testing</h1>
    <h2>Hey ${req.oidc.user.name}</h2>
    <h4>Username: ${req.oidc.user.nickname}</h4>
    <p>${req.oidc.user.email}</p>
    <img src="${req.oidc.user.picture}">` : "<h1> Welcome to CrypCakes!</h1> <h3> You are currently not signed in</h3>")
  });

  app.use(async (req, res, next) => {
    if (req.oidc.isAuthenticated) {const [user] = await User.findOrCreate({where: {email : req.oidc.user.email,username : req.oidc.user.nickname, name : req.oidc.user.name}})}
    next()
  })

app.get('/cupcakes', requiresAuth(),  async (req, res, next) => {
  try {
    const cupcakes = await Cupcake.findAll();
    res.send(cupcakes);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// error handling middleware
app.use((error, req, res, next) => {
  console.error('SERVER ERROR: ', error);
  if(res.statusCode < 400) res.status(500);
  res.send({error: error.message, name: error.name, message: error.message});
});

app.listen(PORT, () => {
  console.log(`Cupcakes are ready at http://localhost:${PORT}`);
});

