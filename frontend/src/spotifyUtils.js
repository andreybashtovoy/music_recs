// spotifyUtils.js

export const getTrackInfo = async (trackId, spotifyApi) => {
    try {
        const trackData = await spotifyApi.getTrack(trackId);

        return {
            id: trackData.id,
            name: trackData.name,
            artist: trackData.artists[0].name,
            cover: trackData.album.images[0].url,
            preview_url: trackData.preview_url,
            uri: trackData.uri,
            color: ['#FF0000', '#00FF00'], // Можно добавить динамическое определение цветов
            active: false
        };
    } catch (error) {
        console.error('Error fetching track info:', error);
        throw error;
    }
};

export const addTrackToUrl = (trackId) => {
    const currentUrl = new URL(window.location.href);
    const searchParams = new URLSearchParams(currentUrl.search);

    let tracks = searchParams.get('tracks')?.split(',') || [];
    if (!tracks.includes(trackId)) {
        tracks.push(trackId);
    }

    searchParams.set('tracks', tracks.join(','));
    currentUrl.search = searchParams.toString();

    window.history.pushState({}, '', currentUrl.toString());
};

export const removeTrackFromUrl = (trackId) => {
    const currentUrl = new URL(window.location.href);
    const searchParams = new URLSearchParams(currentUrl.search);

    let tracks = searchParams.get('tracks')?.split(',') || [];
    tracks = tracks.filter(id => id !== trackId);

    if (tracks.length > 0) {
        searchParams.set('tracks', tracks.join(','));
    } else {
        searchParams.delete('tracks');
    }

    currentUrl.search = searchParams.toString();
    window.history.pushState({}, '', currentUrl.toString());
};