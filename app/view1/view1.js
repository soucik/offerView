'use strict';

angular.module('myApp.view1', ['ngRoute'])

  .service('commonService', function ($http) {

    // Service to get file offer.json
    this.getOffer = function () {
      return $http.get("offer.json");
    };

    // Makes Array from object
    this.objToArray = function (data) {
      var arr = [],
        keys = Object.keys(data);
      for (var i = 0, n = keys.length; i < n; i++) {
        var key = keys[i];
        arr[i] = data[key];
      }
      return arr;
    };
  })

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/view1', {
      templateUrl: 'view1/view1.html',
      controller: 'View1Ctrl'
    });
  }])

  .controller('View1Ctrl', ['commonService', '$scope', '$http', 'moment', function (commonService, $scope, $http, moment) {

    // Offer Parser, returns parsed offer
    $scope.parseOffer = function (offerToParse) {
      var eventChanceTypesList = offerToParse.EventChanceTypes;
      $scope.oddsList = commonService.objToArray(offerToParse.Odds); // assign Array list of odds to view scope
      var labelsList = commonService.objToArray(offerToParse.Labels); // assign Array list of labels
      var leaguesList = labelsList.filter(league => { return league.Typ == 'LC' }); // list of leags
      var regionsList = labelsList.filter(region => { return region.Typ == 'RE' }); // list of regions
      var sportList = labelsList.filter(sport => { return sport.Typ == 'SP' }); // list of sports

      // Maps events within leagues
      var leaguesEvents = leaguesList.map(league => {
        return {
          LeagueName: league.Name,
          Events: eventChanceTypesList.filter(event => event.LeagueCupID == league.ID)
        }
      });

      // Assigns spor name based on event argument
      var assignSportName = function (event) {
        return sportList.filter(sport => sport.ID == event.SportID).map(sport => sport.Name).toString()
      }

      // Makes leag Events with sports name
      Object.keys(leaguesEvents).forEach(function (key, index) {
        leaguesEvents[key].SportName = assignSportName(leaguesEvents[key].Events[0]);
      });
      return leaguesEvents;
    }

    commonService.getOffer()
      .success(function (offer) {
        $scope.Leagues = $scope.parseOffer(offer); // Parse respoded offer and assign it to view scope
      });

      $scope.clicked = function(){
        $scope.state = 'clickedStyle';
      }

      $(document).ready(function () {
        var leagueDivs = $('div.leagueSport');
        var current = 0;
        leagueDivs.hide();
        Fader();
        function Fader() {
            $(leagueDivs[current]).fadeIn('slow').delay(1000);
            $(leagueDivs[current]).queue(function () {
                current = current + 1;
                if (current < leagueDivs.length) {
                    Fader();
                    $(this).dequeue();
                }
            });
        }
    });



  }]);