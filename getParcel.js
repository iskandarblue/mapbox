var exports = module.exports = {};

exports.getParcel = function(parcel, tablename, connection, callback) {
  console.log('tablename: ' + tablename + 'parcel: '+parcel);
     connection.query('SELECT * FROM ' + ''+tablename+'' + ' WHERE RELKEY = ' + parcel ,
         function(error, result) {
             if (error) {
             return callback(error) 
           }
           return callback(result) 
       } 
      ) }
