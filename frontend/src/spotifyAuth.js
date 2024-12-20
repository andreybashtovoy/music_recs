// spotifyAuth.js

const getCurrentUri = () => {
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';
    return url.toString();
};

const CLIENT_ID = 'ba49d852852848bbbb736385c468dc9b';
const REDIRECT_URI = getCurrentUri();
const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${REDIRECT_URI}&scope=user-library-read%20user-read-private%20user-read-email%20user-read-playback-state%20user-modify-playback-state%20streaming`;


export const saveToken = (token) => {
    localStorage.setItem('spotify_token', token);
    localStorage.setItem('token_timestamp', Date.now());
};

export const getStoredToken = () => {
    const token = localStorage.getItem('spotify_token');
    const timestamp = localStorage.getItem('token_timestamp');

    if (token && timestamp) {
        const now = Date.now();
        const hoursPassed = (now - parseInt(timestamp)) / (1000 * 60 * 60);

        if (hoursPassed < 1) {
            return token;
        } else {
            localStorage.removeItem('spotify_token');
            localStorage.removeItem('token_timestamp');
        }
    }
    return null;
};

export const authorizeSpotify = () => {
    const currentParams = new URLSearchParams(window.location.search);
    localStorage.setItem('spotify_redirect_params', currentParams.toString());

    window.location.href = AUTH_URL;
};

export const getAuthTokenFromUrl = () => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1));
    const token = params.get('access_token');

    if (token) {
        saveToken(token);

        const savedParams = localStorage.getItem('spotify_redirect_params');
        if (savedParams) {
            window.location.hash = '';
            window.location.search = savedParams;
            localStorage.removeItem('spotify_redirect_params');
        } else {
            window.location.hash = '';
        }
    }
    return token;
};


export const setSpotifyToken = (token, spotifyApi) => {
    spotifyApi.setAccessToken(token);
};