'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findFirst = findFirst;
var https = require('https');

var API_KEY = process.env.API_KEY;

var url = 'https://api.the-odds-api.com/v2/odds/?sport=NRL&region=au&apiKey=' + API_KEY;

var payload = {};

https.get(url, function (resp) {
  var data = '';

  // A chunk of data has been recieved.
  resp.on('data', function (chunk) {
    data += chunk;
  });

  // The whole response has been received. Print out the result.
  resp.on('end', function () {
    // console.log(data)
    payload = JSON.parse(data);
    bets(payload.data.events);
  });
}).on('error', function (err) {
  console.log('Error: ' + err.message);
});

function lastWord(name) {
  return name.split(/[, ]+/).pop();
}

var hasProp = function hasProp(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};

function findFirst() {
  var arr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var predicateFn = arguments[1];
  var ctx = arguments[2];

  var result = null;
  arr.some(function (el, i) {
    if (predicateFn.call(ctx, el, i, arr)) {
      result = el;
      return true;
    }
    return false;
  });
  return result;
}

var SITE_STRAT = ['unibet', 'ladbrokes', 'sportsbet', 'williamhill', 'tab', 'pinnacle'];

function getSite(sites) {
  var site = findFirst(SITE_STRAT, function (s) {
    return hasProp(sites, s);
  });
  // console.log(`  Using ${site}`)
  return sites[site];
}

function getOdds(sites) {
  return getSite(sites).odds.h2h;
}

function bets(events) {
  var bets = Object.keys(events).reduce(function (acc, name) {
    var event = events[name];
    var odds = getOdds(event.sites);
    var team1 = event.participants[0];
    var team2 = event.participants[1];
    var bet = odds[0] < odds[1] ? team1 : team2;
    var shortName = lastWord(bet);
    // console.log({ name, odds, bet, shortName })
    acc.push(lastWord(team1) + ' vs ' + lastWord(team2) + ' => ' + lastWord(bet));
    return acc;
  }, []);

  // console.log(bets)

  bets.slice(0, 8).map(function (bet) {
    console.log(bet);
  });
}

