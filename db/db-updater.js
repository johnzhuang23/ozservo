const testServo = require('./models/data.js')


// create array for data.js where state is in Victoria
// change the json file to js, eg data.json > data.js
let stationsArray = []
let stations = testServo
stations.forEach(station => {
  if (stationsArray.length === 500) {
    return
  } else {
    if (station["STATE"] === "Victoria") {
      stationsArray.push(station)
    }
  }
})


// for each station, add in new data to servo table
stationsArray.forEach(station => {
  // create template for sql
  let sql = `INSERT INTO servos (name, owner, street_address, suburb, state, latitude, longitude) VALUES ($1, $2, $3, $4, $5, $6, $7);`
  let params = [station["NAME"], station["OWNER"], station["ADDRESS"], station["SUBURB"], station["STATE"], station["LATITUDE"], station["LONGITUDE"]]
  pool.query(sql, params, (err, dbres) => {
    // if an error occurs, show what data is giving error, and what the error is
    if (err) {
      console.log(station)
      return console.error('did not work', err.stack)
    }
  });
})
res.json(stationsArray)