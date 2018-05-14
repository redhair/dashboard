var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var path = require('path');
var port = process.env.PORT || 5000;

var app = express();

app.use(cors());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, '../client', 'views'));
app.use(express.static(path.resolve(__dirname, '../client')));

app.get('/', function(req, res) {
  res.render('index.ejs');
});

require('./routes/organizations')(app);
require('./routes/categories')(app);
require('./routes/products')(app);
require('./routes/users')(app);
require('./routes/mailer')(app);

app.get('/*', function(req, res) {
  res.render('index.ejs');
});

app.listen(port, function() {
  console.log('\x1b[35m', new Date().toLocaleString() + ' => Server started on port: ' + port);
});
