const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

//Returns a list of all players in the team
app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
      cricket_team;`
  const playersArray = await db.all(getPlayersQuery)
  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

//Create a new player in the team (database). player_id is auto-incremented
app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {player_name, jersey_number, role} = playerDetails
  const addPlayerQuery = `
    INSERT INTO
      cricket_team (player_name, jersey_number, role)
    VALUES
      (
        '${player_name}',
         ${jersey_number},
        '${role}'
      );`

  const dbResponse = await db.run(addPlayerQuery)
  const bookId = dbResponse.lastID
  response.send('Player Added to Team')
})

//Returns a player based on a player ID
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
    SELECT
      *
    FROM
      cricket_team
    WHERE
      player_id = ${playerId};`
  const player = await db.get(getPlayerQuery)
  response.send(player)
})

//Updates the details of a player in the team (database) based on the player ID
app.put('/player/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {player_name, jersey_number, role} = playerDetails
  const updatePlayerQuery = `
    UPDATE
      cricket_team
    SET
      player_name=${player_name},
      jersey_number=${jersey_number},
      role=${role}
    WHERE
      player_id = ${playerId};`
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

//Deletes a player from the team (database) based on the player ID
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `
    DELETE FROM
      cricket_team
    WHERE
      player_id = ${playerId};`
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})
module.exports = app
