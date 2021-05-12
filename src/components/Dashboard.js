import TrackSearchResult from './TrackSearchResult'
import React, { useEffect, useState } from 'react'
import { Container, Form } from 'react-bootstrap'
import SpotifyWebApi from 'spotify-web-api-node'
import useAuth from '../hooks/useAuth'
import Player from './Player'
import axios from 'axios'

const spotifyApi = new SpotifyWebApi({
    clientId: 'ad20fed2ce054d9e9b600324f79d8296',
})

export default function Dashboard({ code }) {
    const accessToken = useAuth(code)
    const [search, setSearch] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [playingTrack, setPlayingTrack] = useState()
    const [lyrics, setLyrics] = useState('')

    function chooseTrack(track) {
        setPlayingTrack(track)
        // clear out the search field once we choose a track
        setSearch('')
        // whenever we change songs, set the lyrics to an empty string
        setLyrics('')
    }

    // hook for our API to access the lyrics
    useEffect(() => {
        // make sure that we first have a playing track - so, if we don't have a playing track, then return
        if (!playingTrack) return

        axios
        // .get('http://localhost:3001/lyrics', {
        .get('https://spotify-by-smith.herokuapp.com/lyrics', {
            params: {
                track: playingTrack.title,
                artist: playingTrack.artist,
            },
        })
        .then(res => {
            setLyrics(res.data.lyrics)
        })
    }, [playingTrack]) // this useEffect hook will run anytime the song (i.e. playingTrack) changes

    useEffect(() => {
        // first verify whether we have an access token - so if we do not have an access token, then return
        if (!accessToken) return
        // otherwise, whenever our access token changes, set the access token on our spotifyApi
        spotifyApi.setAccessToken(accessToken)
    }, [accessToken])

    // useEffect for searching
    useEffect(() => {
        if (!search) return setSearchResults([])
        if (!accessToken) return

        let cancel = false
        spotifyApi.searchTracks(search).then(res => {
            if (cancel) return
            // loop through all of the images
            setSearchResults(
                res.body.tracks.items.map(track => {
                const smallestAlbumImage = track.album.images.reduce(
                    (smallest, image) => {
                    // if at any point the current image is smaller than the smallest image, then set that as the smallest image
                    if (image.height < smallest.height) return image
                    return smallest
                }, 
                track.album.images[0]
                )

                return {
                    artist: track.artists[0].name,
                    title: track.name,
                    uri: track.uri,
                    albumUrl: smallestAlbumImage.url,
                }
            })
            )
        })
        return () => (cancel = true)
    }, [search, accessToken]) // every time our search query changes or accessToken changes, re-run this code

    return (
        <Container className="d-flex flex-column py-2" style={{ height: '100vh' }}>
            <Form.Control
            type="search"
            placeholder="Search Song/Artist"
            value={search}
            onChange={e => setSearch(e.target.value)}
            />
                    
         <div className="flex-grow-1 my-2" style={{ overflowY: 'auto' }}>
             {searchResults.map(track => (
                 <TrackSearchResult 
                 track={track} 
                 key={track.uri} 
                 chooseTrack={chooseTrack} 
                 />
         ))}
         {searchResults.length === 0 && (
             <div className="text-center" style={{ whiteSpace: 'pre' }}>
                 {lyrics}
             </div>
         )}
         </div>
         <div>
             <Player accessToken={accessToken} trackUri={playingTrack?.uri} />
        </div>
        </Container>
    )
}
