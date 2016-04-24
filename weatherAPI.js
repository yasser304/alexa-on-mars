var http = require('http');
var options = {
  host: 'marsweather.ingenology.com',
  port: 80,
  path: '/v1/latest/',
  method: 'GET'
};

var logResponse = function(response, context) {
    var str = '';
  response.on('data', function (chunk) {
    str += chunk;
  });
  
  response.on('end', function () {
    var obj = JSON.parse(str);
    context.done(null, obj.report);
  });
};

exports.handler = function(event, context) {

    var req = http.request(options, function(res){
        logResponse(res, context);
    });

    req.end();
};