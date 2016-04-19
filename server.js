// Requiring dependency modules
var express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    yahooFinance = require('yahoo-finance'),
    moment = require('moment');

// Express app configurations  
var port = process.env.PORT || 3000;
app.use(bodyParser.json());  
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.set('view engine', 'pug');

// Symbols and fields of interest
var SYMBOLS = ['VNET', 'AMRK', 'AIR', 'ACIW', 'ACNB', 'ADTN', 'ALMG', 'ALO.PA', 'WBAI', 'DDD'];
var FIELDS = ['s', 'n', 'p', 'j1'];

// Home route
app.get('/', function(req, res) {
    res.render('index', function(error, html) {
        if (error) {
            console.log(error);
        } else {
            res.send(html);     
        }
    });
});

// Historical endpoint
app.get('/pullhistorical', function(req, res) {
    yahooFinance.historical({
    symbols: SYMBOLS,
    from: moment().subtract(14,'d').format('YYYY-MM-DD'),
    to: moment().format('YYYY-MM-DD'),
    period: 'd'
  }, function (error, result) {
    var allPrices = [],
        stockIdentifier = [],
        stockSymbol = "",
        stockPrices = [];
   
    for (stock in result) {
        
        result[stock].forEach(function(day) {
            
            stockPrices.push((Math.round(day.close * 10) / 10));
            stockSymbol = day.symbol;
        });
        
        stockIdentifier.push([stockSymbol]);
        stockIdentifier.push(stockPrices);
        
        allPrices.push(stockIdentifier);
        
        
        stockSymbol = "";
        stockPrices = [];
        stockIdentifier = [];
    }
    
    if (error) {
        console.log(error);
    } else {
        // console.log(allPrices);
        res.send(allPrices);
    }
    
    });
    
    
});

// Snapshot endpoint
app.get('/pullsnapshot', function(req, res) {
    
    yahooFinance.snapshot({
       symbols: SYMBOLS,
       fields: FIELDS
    }, function (error, snapshot) {
        if (error) {
            console.log(error);
        } else {
            console.log(snapshot);
            res.send(snapshot);
        }       
    });
    
});

app.listen(port);
console.log('Listening...');