
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , sqlite3 = require('sqlite3').verbose()
  , testDB = new sqlite3.Database('tester.db')
  , db = new sqlite3.Database('investigations.db3');
var app = module.exports = express.createServer();

/*
testDB.serialize(function() {
  
  testDB.run("CREATE TABLE Address (id INTEGER PRIMARY KEY AUTOINCREMENT,  lat NUMERIC, lon NUMERIC, line varchar(255))");
  testDB.run("CREATE TABLE Investigation ( date varchar(200))");//INTEGER PRIMARY KEY AUTOINCREMENT,
  testDB.run("CREATE TABLE Deficiences (description varchar(200), investigationId INTEGER, FOREIGN KEY(investigationId) REFERENCES Investigation(rowid))");


  var stmt = testDB.prepare("INSERT INTO ADDRESS(lat, lon, line) VALUES (?, ?, ?)");
  for (var i = 0; i < 10; i++) {
      stmt.run([43.64, -79.39, 'Toronto something']);
  }
  stmt.finalize();
  
  stmt = testDB.prepare("INSERT INTO Investigation VALUES (?)");
  for (var i = 0; i < 5; i++) {
      stmt.run(['RATS']);
  }
  stmt.finalize();


  testDB.each("SELECT rowid AS id, lat, lon, line FROM Address", function(err, row) {
    if (err){
      console.log(err);
    }else{
      console.log(row.id + ": " + row.line + " lat:" + row.lat + " lon " + row.lon);
    }
  });
  testDB.each("SELECT id, description FROM Investigation", function(err, row) {
    if (err){
      console.log(err);
    }else{
      console.log(row.id + ": " + row.description);
    }
  });

});

db.close();
*/
// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);

app.get('/addresses', function(req, res){
  var mockup = [];
  var count = 0;
  db.each("SELECT rowid AS id, lat, long AS lon, line  FROM Address", function(err, row) {
    if (err){
      console.log(err);
    }else{
      console.log(row.id + ": " + row.line + " lat:" + row.lat + " lon " + row.lon);
    }
    //row.lat = 43.64 + count*0.00001;
    //row.lon = -79.39 + count*0.00001;
    count++;
    if (row.lat != -1 && count <10000){
      mockup.push(row);
    }
  },
  function(){
    res.send(mockup);
  });
});

app.get('/addresses/:id', function(req, res){
  
  /*var junk = [{
    description : 'Rats rats rats! so many rats running around everywhere!!!'
  , address : '235 King St'
  , location : 'First floor '
  , status : 'open'
  , date : 'May 1, 2012'
  },
  {
    description : 'Toilet leaking from top floor'
  , address : '235 King St'
  , location : 'Second floor'
  , status : 'open'
  , date : 'February 1, 2012'
  }];
*/
  var mockup = [];
  var count = 0;
  db.each("SELECT * FROM Deficiencies WHERE investigationId IN (SELECT ROWID FROM Investigation WHERE addressId = ?);"
    , req.params.id
    ,function(err, row) {
    if (err){
      console.log(err);
    }else{
      console.log(JSON.stringify(row));
    }
    row.address = '12 King St';
    row.date = 'March 12, 2012';
    mockup.push(row);
  },
  function(){
    res.send(mockup);
  });

});

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
