import React, { useState, useEffect } from 'react'
import axios from 'axios'

// this is a custom hook
export default function useAuth(code) {
    // the 3 pieces of info that we need
    const [accessToken, setAccessToken] = useState()
    const [refreshToken, setRefreshToken] = useState()
    const [expiresIn, setExpiresIn] = useState()

    // in order to get the above 3 pieces of info, we will use a useEffect
    useEffect(() => {
        // post our code to the following route, which will allow it to be called on the server for us
        axios
        .post('http://localhost:3001/login', {
            code,
        })
        .then(res => {
            setAccessToken(res.data.accessToken)
            setRefreshToken(res.data.refreshToken)
            setExpiresIn(res.data.expiresIn)
            window.history.pushState({}, null, '/')
        })
        // if there is an error, redirect user back to login page
        .catch(() => {
            window.location = '/'
        })
        // code is our input, or what we want to cause to run this useEffect every time 'code' changes
    }, [code])

    useEffect(() => {
        if (!refreshToken || !expiresIn) return
        // make sure that this refresh only happens right before our token expires by setting a setTimout
        // run this every time (i.e. in an interval) our expiresIn time is about to change, 
        const interval = setInterval(() => {
        axios
        .post('http://localhost:3001/refresh', {
            refreshToken,
        })
        .then(res => {
            setAccessToken(res.data.accessToken)
            setExpiresIn(res.data.expiresIn)
        })
        .catch(() => {
            window.location = '/'
        })
        // refresh this expiresIn time one minute before it expires
        // * 1000 to convert one minute/60 seconds to milliseconds
    }, (expiresIn - 60) * 1000)
    // if for some reason our refreshToken or expiresIn changes before an actual refresh, clear the timeout so that we don't use an incorrect refresh token
    return () => clearInterval(interval)
        // whenever the refreshToken or the expiresIn token changes, then run this useEffect
    }, [refreshToken, expiresIn])

    return accessToken
}
