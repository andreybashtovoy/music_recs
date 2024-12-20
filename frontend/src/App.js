import React, {useState, useEffect, useRef} from 'react';
import styled from 'styled-components';
import './App.css';
import SpotifyWebApi from 'spotify-web-api-js';
import {
    getAuthTokenFromUrl,
    authorizeSpotify,
    setSpotifyToken,
    getStoredToken
} from './spotifyAuth';
import Player from './components/Player';
import Song from './components/Song';
import Library from './components/Library';
import Nav from './components/Nav';
import {getTrackInfo} from './spotifyUtils';
import {updateUrlParams, getUrlParams} from './urlUtils';

const App = () => {
    const audioRef = useRef(null);

    // State
    const [songs, setSongs] = useState([]); // Песни
    const [currentSong, setCurrentSong] = useState(null); // Текущая песня
    const [isPlaying, setIsPlaying] = useState(false); // Статус воспроизведения
    const [libraryStatus, setLibraryStatus] = useState(false); // Статус библиотеки
    const [songInfo, setSongInfo] = useState({currentTime: 0, duration: 0}); // Информация о песне
    const [accessToken, setAccessToken] = useState(null); // Токен доступа
    const [spotifyApi] = useState(new SpotifyWebApi()); // Экземпляр Spotify API

    // Базовый трек и дополнительные треки из URL
    const defaultTrackId = '5lT5IZWW3JQErXELJpQgJ9';
    const [trackIds, setTrackIds] = useState([defaultTrackId]);

    // Обработка авторизации и параметров URL
    useEffect(() => {
        const handleAuth = () => {
            const urlToken = getAuthTokenFromUrl();
            const storedToken = getStoredToken();
            const token = urlToken || storedToken;

            if (token) {
                setAccessToken(token);
                setSpotifyToken(token, spotifyApi);
            }
        };

        handleAuth();
    }, [spotifyApi]);

    // Обработка параметров URL и загрузка треков
    useEffect(() => {
        const loadTracksFromUrl = () => {
            const queryParams = getUrlParams();
            const tracksParam = queryParams.get('tracks');

            if (tracksParam) {
                const additionalTracks = tracksParam.split(',');
                setTrackIds([...additionalTracks]);
            } else {
                setTrackIds([defaultTrackId]);
            }
        };

        loadTracksFromUrl();
    }, [window.location.search]); // Зависимость от изменения URL

    // Загрузка информации о треках
    useEffect(() => {
        if (accessToken && trackIds.length > 0) {
            const fetchTracks = async () => {
                try {
                    const tracksData = await Promise.all(
                        trackIds.map(id => getTrackInfo(id, spotifyApi))
                    );

                    const tracksWithActive = tracksData.map((track, index) => ({
                        ...track,
                        active: index === 0
                    }));

                    setSongs(tracksWithActive);
                    setCurrentSong(tracksWithActive[0]);
                } catch (error) {
                    console.error('Error fetching tracks:', error);
                }
            };

            fetchTracks();
        }
    }, [trackIds, accessToken, spotifyApi]);

    // Обновленная функция для авторизации
    const handleAuthClick = () => {
        const storedToken = getStoredToken();
        if (storedToken) {
            setAccessToken(storedToken);
            setSpotifyToken(storedToken, spotifyApi);
        } else {
            authorizeSpotify();
        }
    };

    // Обновление времени в плеере
    const updateTimeHandler = (e) => {
        const currentTime = e.target.currentTime;
        const duration = e.target.duration;
        setSongInfo({...songInfo, currentTime, duration});
    };

    // Завершение воспроизведения текущей песни
    const songEndHandler = async () => {
        let currentIndex = songs.findIndex((song) => song.id === currentSong.id);
        let nextSong = songs[(currentIndex + 1) % songs.length];
        await setCurrentSong(nextSong);

        const newSongs = songs.map((song) => {
            if (song.id === nextSong.id) {
                return {...song, active: true};
            } else {
                return {...song, active: false};
            }
        });
        setSongs(newSongs);

        if (isPlaying) {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    audioRef.current.play();
                });
            }
        }
    };

    // Обработчик ошибок воспроизведения
    const handlePlayError = (error) => {
        console.error('Error playing track:', error);
        // Можно добавить пользовательское уведомление об ошибке
    };

    // Рендер страницы авторизации
    if (!accessToken) {
        return (
            <div className="auth-container">
                <h1>Welcome to Spotify Music App</h1>
                <button className="auth-button" onClick={handleAuthClick}>
                    Login with Spotify
                </button>
            </div>
        );
    }

    // Рендер загрузки
    if (!currentSong) {
        return (
            <LoadingContainer>
                <h2>Loading tracks...</h2>
            </LoadingContainer>
        );
    }

    // Основной рендер приложения
    return (
        <AppContainer libraryStatus={libraryStatus}>
            <Nav
                libraryStatus={libraryStatus}
                setLibraryStatus={setLibraryStatus}
                updateUrlParams={updateUrlParams}
            />
            <Song currentSong={currentSong}/>
            <Player
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                currentSong={currentSong}
                setCurrentSong={setCurrentSong}
                audioRef={audioRef}
                songInfo={songInfo}
                setSongInfo={setSongInfo}
                songs={songs}
                setSongs={setSongs}
                spotifyApi={spotifyApi}
                accessToken={accessToken}
            />
            <Library
                songs={songs}
                setCurrentSong={setCurrentSong}
                audioRef={audioRef}
                isPlaying={isPlaying}
                setSongs={setSongs}
                libraryStatus={libraryStatus}
                setLibraryStatus={setLibraryStatus} // Добавьте эту строку
            />
            <audio
                onLoadedMetadata={updateTimeHandler}
                onTimeUpdate={updateTimeHandler}
                onEnded={songEndHandler}
                onError={handlePlayError}
                ref={audioRef}
                src={currentSong.preview_url}
            />
        </AppContainer>
    );
};

const AppContainer = styled.div`
    transition: all 0.5s ease;
    margin-left: ${(p) => (p.libraryStatus ? '20rem' : '0')};
    @media screen and (max-width: 768px) {
        margin-left: 0;
    }
`;

const LoadingContainer = styled.div`
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(to right, #1DB954, #191414);
    color: white;
`;

// Стили для страницы авторизации
const styles = `
	body {
		background: linear-gradient(90deg, #67827c, white);
	}

    .auth-container {
        height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background: linear-gradient(to right, #1DB954, #191414);
    }

    .auth-container h1 {
        color: white;
        margin-bottom: 2rem;
        font-size: 2.5rem;
        text-align: center;
    }

    .auth-button {
        padding: 1rem 2rem;
        font-size: 1.2rem;
        background-color: #1DB954;
        color: white;
        border: none;
        border-radius: 50px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .auth-button:hover {
        background-color: #1ed760;
        transform: scale(1.05);
    }
`;

// Добавляем стили в head документа
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default App;