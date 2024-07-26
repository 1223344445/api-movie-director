const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()
app.use(express.json())

let db = null
const dbPath = path.join(__dirname, 'moviesData.db')

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const convertMovieNametoPascalCase = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  }
}

app.get('/movies/', async (request, response) => {
  const moviesListQuery = `SELECT movie_name FROM movie;`
  const movieList = await db.all(moviesListQuery)
  response.send(
    movieList.map((moviename) => convertMovieNametoPascalCase(moviename)),
  )
})

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const addMovieQuery = `INSERT INTO movie(director_id,movie_name,lead_actor)
  VALUES(${directorId},'${movieName}','${leadActor}');
  `
  await db.run(addMovieQuery)
  response.send('Movie Successfully Added')
})

const convertdbObjectTOResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id=${movieId};`
  const movieDetails = await db.get(getMovieQuery)
  response.send(convertdbObjectTOResponseObject(movieDetails))
})

app.put('/movies/:movieId/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const {movieId} = request.params
  const updateQuery = `UPDATE movie SET 
  director_id=${directorId},
  movie_name='${movieName}',
  lead_actor='${leadActor}'
  WHERE movie_id=${movieId};`
  await db.run(updateQuery)
  response.send('Movie Details Updated')
})

//5
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteQuery = `DELETE FROM movie WHERE movie_id=${movieId};`
  await db.run(deleteQuery)
  response.send('Movie Removed')
})

//6
const convert_ = (dbobj) => {
  return {
    directorId: dbobj.director_id,
    directorName: dbobj.director_name,
  }
}

app.get('/directors/', async (request, response) => {
  const directorquery = `SELECT * from director;`
  const directorsList = await db.all(directorquery)
  response.send(directorsList.map((each_dir) => convert_(each_dir)))
})

//7
const convertMoviename = (dbobj) => {
  return {
    movieName: dbobj.movie_name,
  }
}

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const query_ = `SELECT movie.movie_name FROM movie join director on movie.director_id=director.director_id WHERE
  director.director_id=${directorId};
  `
  const director_movieList = await db.all(query_)
  response.send(director_movieList.map((each_) => convertMoviename(each_)))
  //console.log(director_movieList)
})

module.exports=app;


