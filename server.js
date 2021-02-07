const pg=require('pg');
const client = new pg.Client('postgress://localhost/movies_db');
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
                                    <a href="/movies/movie.id">
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
        // res.send(movies.map((movie)=>{
        //     return movie.name;
        //     console.log(movie)
        // }).join(' '));
    }catch(err){
        next(err);
    }
})

const syncAndSeed= async()=>{
    const SQL=`
        DROP TABLE IF EXISTS "Movie_Details";
        DROP TABLE IF EXISTS "Movies";
        create TABLE "Movies"(
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL
        );
        create TABLE "Movie_Details"(
            id SERIAL PRIMARY KEY,
            userId INTEGER REFERENCES "Movies" NOT NULL,
            description TEXT DEFAULT NULL,
            rating VARCHAR(100) NOT NULL
        );

        INSERT INTO "Movies" (name) VALUES ('The Dark Knight');
        INSERT INTO "Movies" (name) VALUES ('The Phantom Menace');
        INSERT INTO "Movies" (name) VALUES ('Goodfellas');
        INSERT INTO "Movies" (name) VALUES ('The Godfather');
        INSERT INTO "Movies" (name) VALUES ('Avengers Infinity War');
        INSERT INTO "Movies" (name) VALUES ('Captain America: The Winter Soldier');

        INSERT INTO "Movie_Details" (userId, description, rating) VALUES ((SELECT id from "Movies" where name='The Dark Knight'),'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.','9 stars');
        INSERT INTO "Movie_Details" (userId, description, rating) VALUES ((SELECT id from "Movies" where name='The Phantom Menace'),'Two Jedi escape a hostile blockade to find allies and come across a young boy who may bring balance to the Force, but the long dormant Sith resurface to claim their original glory.','6.5 stars');
        INSERT INTO "Movie_Details" (userId, description, rating) VALUES ((SELECT id from "Movies" where name='Goodfellas'),'The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners Jimmy Conway and Tommy DeVito in the Italian-American crime syndicate.','8.7 stars');
        INSERT INTO "Movie_Details" (userId, description, rating) VALUES ((SELECT id from "Movies" where name='The Godfather'),'An organized crime dynasty aging patriarch transfers control of his clandestine empire to his reluctant son.','9.2 stars');
        INSERT INTO "Movie_Details" (userId, description, rating) VALUES ((SELECT id from "Movies" where name='Avengers Infinity War'),'The Avengers and their allies must be willing to sacrifice all in an attempt to defeat the powerful Thanos before his blitz of devastation and ruin puts an end to the universe.','8.4 stars');
        INSERT INTO "Movie_Details" (userId, description, rating) VALUES ((SELECT id from "Movies" where name='Captain America: The Winter Soldier'),'As Steve Rogers struggles to embrace his role in the modern world, he teams up with a fellow Avenger and S.H.I.E.L.D agent, Black Widow, to battle a new threat from history: an assassin known as the Winter Soldier.','7.7 stars');

    `;
    await client.query(SQL) 
}

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