var pg = require('pg');
var getParcel = require('./getParcel.js')
let express = require('express');
var path = require('path');
 let app = express();
let port = process.env.PORT || 8081;// set our port

// create a config to configure both pooling behavior
// and client options
// note: all config is optional and the environment variables
// will be read if the config is not present
var config = {
  user: 'awsuser', //env var: PGUSER
  database: 'mydb', //env var: PGDATABASE
  password: 'mypassword', //env var: PGPASSWORD
  host: 'mydbinstance.cpu2z0a5bugq.us-east-2.rds.amazonaws.com', // Server hosting the postgres database
  port: 5432, //env var: PGPORT
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};

let router = express.Router(); 
//it will keep idle connections open for a 30 seconds
//and set a limit of maximum 10 idle clients
var pool = new pg.Pool(config);

app.get('/', function(req, res) {     res.sendFile(path.join(__dirname + '/test_parcel.html')); });

// to run a query we can acquire a client from the pool,
// run a query on the client, and then return the client to the pool
pool.connect(function(err, client, done) {
  if(err) {
    return console.error('error fetching client from pool', err);
  }

  router.route('/parcels/:table_name/parcel/:parcel_code') .get(
    function(req, res) { 
      getParcel.getParcel(req.params.parcel_code, req.params.table_name, client, function(result){
      	return res.json({ message: result }); 
      });
  });
  //this initializes a connection pool


/*  client.query('SELECT * FROM parcel11 WHERE RELKEY = 390098;', function(err, result) {
    //call `done()` to release the client back to the pool
    done();

    if(err) {
      return console.error('error running query', err);
    }
    console.log(result.rows);
    //output: 1
  });
  */
});

pool.on('error', function (err, client) {
  // if an error is encountered by a client while it sits idle in the pool
  // the pool itself will emit an error event with both the error and
  // the client which emitted the original error
  // this is a rare occurrence but can happen if there is a network partition
  // between your application and the database, the database restarts, etc.
  // and so you might want to handle it and at least log it out
  console.error('idle client error', err.message, err.stack)
})

app.use('/api', router);
app.listen(port);
console.log('START APP on port ' + port);
