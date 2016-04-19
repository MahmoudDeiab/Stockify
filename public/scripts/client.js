'use strict';
var app = angular.module('app', ['chart.js']);
app.controller('mainController', function($scope, $http) {
    
    // Variable declarations
    var daysNumber = 10,
        stocksNumber = 10,
        allPrices = [];
    
    // Scope variable binding
    $scope.stocks = [];
    $scope.allPricesOnly = [];
    $scope.chartLabels = [];
    $scope.chartSeries = [];
    $scope.chartSeriesCache = [];
    $scope.chartData = [];
    
    // ChartJS options object configurations
    $scope.chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scaleOverride: true,
        scaleSteps: 10,
        scaleStepWidth: 1,
        scaleStartValue: 15
    }
    
    // Sorting and searching table
    $scope.predicate = 'previousClose';
    $scope.reverse = true;
    $scope.order = function(predicate) {
        $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
        $scope.predicate = predicate;
    };
    
    
    
    // Pull snapshot data (Table)
    $http({
        method : "GET",
        url : "/pullsnapshot"
    }).then(function succes(response) {
        
       $scope.stocks = response.data;
       
       async.each($scope.stocks, function(stock, callback) {
           
           $scope.chartSeriesCache.push(stock.symbol);
           $scope.chartSeries = $scope.chartSeriesCache;
           
       }, function(callbackError){
            console.log(callbackError);
        });
     
    }, function error(response) {
        console.log(response.statusText);
    });
    
    
    
    // Pull historical data (Chart)
    $http({
        method : "GET",
        url : "/pullhistorical"
    }).then(function succes(response) {
        
        allPrices = response.data;
        allPrices.forEach(function(secondArray) {
            $scope.allPricesOnly.push(secondArray[1]);
        });
        
        $scope.chartData = $scope.allPricesOnly;
        
    }, function error(response) {
        console.log(response.statusText);
    });
    
    // 
    for(var i = (daysNumber-1); i >= 0; i--) {
        $scope.chartLabels.push(moment().subtract(i,'d').format('YYYY-MM-DD'));
    };
            
    // Showing one stock at a time
    $scope.showStockGraph = function(symbol) {
      allPrices.forEach(function(secondArray) {
          
          if (symbol === secondArray[0][0]) {
              $scope.chartData = [secondArray[1]];
              $scope.chartSeries = [symbol];
              
          }
      });
    };
    
    
    // Showing stocks average prices
    $scope.allPricesSum = Array(daysNumber);
    $scope.showAverage = function() {
        
        var counter = 0;
        for(var i = 0; i < $scope.allPricesSum.length; i++) {
            $scope.allPricesSum[i] = 0;
        }

         $scope.allPricesOnly.forEach(function(stock) {
             
             stock.forEach(function(dayPrice) {
                 $scope.allPricesSum[counter] += dayPrice;
                 counter++;
             });
             
             counter = 0;
                    
         });
                  
         $scope.chartData = [$scope.allPricesSum.map(function(dayPriceSum) {
             return (Math.round((dayPriceSum / stocksNumber) * 100) / 100);
         })];
         
         $scope.chartSeries = ["Average Prices"];
    };
    
    // Showing all stock prices
    $scope.showAll = function() {
        $scope.chartData = $scope.allPricesOnly;
        $scope.chartSeries = $scope.chartSeriesCache;
    };
    
    
});
