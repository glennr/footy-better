const https = require('https')

const API_KEY = process.env.API_KEY

const url = `https://api.the-odds-api.com/v2/odds/?sport=NRL&region=au&apiKey=${API_KEY}`

let payload = {}

https
  .get(url, resp => {
    let data = ''

    // A chunk of data has been recieved.
    resp.on('data', chunk => {
      data += chunk
    })

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      // console.log(data)
      payload = JSON.parse(data)
      bets(payload.data.events)
    })
  })
  .on('error', err => {
    console.log('Error: ' + err.message)
  })

function lastWord(name) {
  return name.split(/[, ]+/).pop()
}

const hasProp = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)

export function findFirst(arr = [], predicateFn, ctx) {
  let result = null
  arr.some((el, i) => {
    if (predicateFn.call(ctx, el, i, arr)) {
      result = el
      return true
    }
    return false
  })
  return result
}

const SITE_STRAT = [
  'unibet',
  'ladbrokes',
  'sportsbet',
  'williamhill',
  'tab',
  'pinnacle',
]

function getSite(sites) {
  let site = findFirst(SITE_STRAT, s => hasProp(sites, s))
  // console.log(`  Using ${site}`)
  return sites[site]
}

function getOdds(sites) {
  return getSite(sites).odds.h2h
}

function bets(events) {
  const bets = Object.keys(events).reduce((acc, name) => {
    const event = events[name]
    const odds = getOdds(event.sites)
    const team1 = event.participants[0]
    const team2 = event.participants[1]
    const bet = odds[0] < odds[1] ? team1 : team2
    const shortName = lastWord(bet)
    // console.log({ name, odds, bet, shortName })
    acc.push(`${lastWord(team1)} vs ${lastWord(team2)} => ${lastWord(bet)}`)
    return acc
  }, [])

  // console.log(bets)

  bets.slice(0, 8).map(bet => {
    console.log(bet)
  })
}
