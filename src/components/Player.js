import React, { useEffect, useState } from 'react'
import SpotifyPlayer from 'react-spotify-web-playback'

export default function Player({ accessToken, trackUri }) {
    const [play, setPlay] = useState(false)

    useEffect(() => setPlay(true), [trackUri])
    // if we don't have an access token, return null (because we don't want to render a SpotifyPlayer if we don't have an accessToken to use with it)
    if (!accessToken) return null
    return (
    <SpotifyPlayer 
        token={accessToken}
        showSaveIcon // allows us to save songs to our Spotify library
        // every time the state changes (i.e. a song finishes, changes, starts, etc.), this callback is called
        callback={state => {
            if (!state.isPlaying) setPlay(false)
        }}
        play={play} // auto-plays a selected track so that you don't have to manually click 'play'
        uris={trackUri ? [trackUri] : []}
        />
    )
}
