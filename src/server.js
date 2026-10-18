const config = require('./config');
const app = require('./app');

app.listen(config.port, () => {
  console.log(`JWT Authentication API running at http://localhost:${config.port}`);
});
