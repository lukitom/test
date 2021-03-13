const request = require('request'); // "Request" library
const TrackModel = require('../database/models/TrackModel');


exports.playlist = (req, res) => {
    //#region uzyskanie tokena do zapytanań do api spotify
    var client_id = your_spotify_client_id; // Your client id
    var client_secret = your_spotify_secret_key; // Your secret

    // your application requests authorization
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        form: {
            grant_type: 'client_credentials'
        },
        json: true
    };
    //#endregion

    // ! TODO: change this library to e.g. axios
    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            const token = body.access_token;

            // console.log() received auth token
            // console.log(token);

            var options = {
            url: `https://api.spotify.com/v1/playlists/${req.params.id}/tracks?market=PL`,              // download tracks from playlist Id received from user
            // url: 'https://api.spotify.com/v1/playlists/37i9dQZEVXbMDoHDwVN2tF/tracks?market=PL',     // download tracks from playlist Id written in this line
            // url: 'https://api.spotify.com/v1/tracks/6tDDoYIxWvMLTdKpjFkc1B?market=PL',               // download one track with Id written in this line
            headers: {
                'Authorization': 'Bearer ' + token
            },
            json: true
            };
            request.get(options, async function(error, response, body) {
            // #region wiele utworów - playlista
            var found = 0;
            for(let i = 0; i < body.total; i++){
                if (body.items[i].track.explicit) continue
                let temp_artist =[];
                body.items[i].track.artists.forEach(element => {
                    temp_artist.push(element.name);
                });
                const newTrack ={
                    title: body.items[i].track.name,
                    artist: temp_artist,
                    _id: body.items[i].track.id,
                    prewiewURL: body.items[i].track.preview_url,
                    uri: body.items[i].track.uri
                };

                //#region aktualizowanie jeśli znajdzie, a jeśli nie ma to dodaje nowy dokument
                await TrackModel.findOneAndUpdate({ _id: newTrack._id }, newTrack, { upsert: true })
                    .then(() => {
                        found++;
                    })
                    .catch(err => {
                        console.log(err.message);
                    });
                // #endregion
            }
            console.log(`Found ${found} tracks.`);
            // #endregion

            // #region dodawanie pojedynczej piosenki bez sprawdzenia czy istnieje
            // let temp_artist =[];
            // body.artists.forEach(element => {
            //     temp_artist.push(element.name);
            // });

            // const newTrack = new TrackModel({
            //     title: body.name,
            //     artist: temp_artist,
            //     _id: body.id,
            //     prewiewURL: body.preview_url,
            //     uri: body.uri
            // });
            // console.log(newTrack);

            // newTrack.save()
            //     .then(() => {
            //         res.redirect('/');
            //     })
            //     .catch((err) => {
            //         console.log(err);
            //     })
            // #endregion

            res.redirect('/');
            });
        }
    });
};