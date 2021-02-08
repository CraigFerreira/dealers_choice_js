const {client, syncAndSeed}= require('./db')

const express= require('express');
const app= express();
const port= 1337;
const path=require('path');
const { static } = require('express');

app.use('/assets', express.static(path.join(__dirname, '/assets')));


app.get('/', async(req, res, next)=>{
    try{
        const response= await client.query(`SELECT * FROM "Movies"`);
        let movies= response.rows
        res.send(`
        <html>
            <head>
                <link rel='stylesheet' href='/assets/style.css'>
            </head>
            <body>
                <h1>Movie Database</h1>
                <ul>
                    ${
                        movies.map(
                            (movie)=>`
                                <li>
                                    <a href="/movies/${movie.id}">
                                        ${movie.name}
                                    </a>
                                </li>
                            `
                        ).join(' ')
                    }
                </ul>
            </body>
        <html>
        `)
    }catch(err){
        next(err);
    }
})

app.get('/movies/:id', async(req, res, next)=>{
    try{
        const response= await client.query(`SELECT * FROM "Movie_Details" where userid=$1;`,[req.params.id]);
        let movies= response.rows
        res.send(`
        <html>
            <head>
                <link rel='stylesheet' href='/assets/style.css'>
            </head>
            <body>
                <h1>Movie Database</h1>
                <ul>
                    ${
                        movies.map(
                            (movie)=>`
                                <div id='movie-display'> 
                                    <div>
                                    ${movie.name}
                                    </div>
                                    <div>
                                    Rating: ${movie.rating} out of 10
                                    </div>
                                    <div>
                                        ${movie.description}
                                    </div>
                                </div>
                            `
                        ).join(' ')
                    }
                </ul>
            </body>
        </html>
        `)
    }catch(err){
        next(err);
    }
})




const setup=async()=>{
    try{
        await client.connect();
        await syncAndSeed();
        console.log('connected to database')
        app.listen(port, ()=>{console.log(`listening on port ${port}`)})
    } catch(err){
        console.log(err)
    }
}

setup();