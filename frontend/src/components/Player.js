import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight, faPlay, faPause } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";

// Styled component for cursor pointer
const pointer = { cursor: "pointer" };

const Player = ({ currentSong, setCurrentSong, isPlaying, setIsPlaying, audioRef, songInfo, setSongInfo, songs, setSongs }) => {

	// Play or pause the song using the HTML5 <audio> API
	const playSongHandler = () => {
		if (isPlaying) {
			audioRef.current.pause();
			setIsPlaying(false);
		} else {
			audioRef.current.play();
			setIsPlaying(true);
		}
	};

	// Toggle between play and pause icons
	const togglePlayPauseIcon = () => {
		return isPlaying ? faPause : faPlay;
	};

	// Helper function to format time
	const getTime = (time) => {
		let minute = Math.floor(time / 60);
		let second = ("0" + Math.floor(time % 60)).slice(-2);
		return `${minute}:${second}`;
	};

	// Handler for dragging the playback bar
	const dragHandler = (e) => {
		audioRef.current.currentTime = e.target.value;
		setSongInfo({ ...songInfo, currentTime: e.target.value });
	};

	// Handler for skipping tracks
	const skipTrackHandler = async (direction) => {
		let currentIndex = songs.findIndex((song) => song.id === currentSong.id);
		let nextSong;

		if (direction === "skip-forward") {
			nextSong = songs[(currentIndex + 1) % songs.length];
		} else if (direction === "skip-back") {
			nextSong = songs[(currentIndex - 1 + songs.length) % songs.length];
		}

		await setCurrentSong(nextSong);
		activeLibraryHandler(nextSong);
		if (isPlaying) {
			audioRef.current.play();
		}
	};

	// Set the new song as active
	const activeLibraryHandler = (newSong) => {
		const newSongs = songs.map((song) => song.id === newSong.id ? { ...song, active: true } : { ...song, active: false });
		setSongs(newSongs);
	};

	return (
		<PlayerContainer>
			<TimeControlContainer>
				<P>{getTime(songInfo.currentTime || 0)}</P>
				<Track currentSong={currentSong}>
					<Input onChange={dragHandler} min={0} max={songInfo.duration || 0} value={songInfo.currentTime} type="range" />
					<AnimateTrack songInfo={songInfo}></AnimateTrack>
				</Track>
				<P>{getTime(songInfo.duration || 0)}</P>
			</TimeControlContainer>
			<PlayControlContainer>
				<FontAwesomeIcon onClick={() => skipTrackHandler("skip-back")} className="skip-back" icon={faAngleLeft} size="2x" style={pointer} />
				<FontAwesomeIcon onClick={playSongHandler} className="play" icon={togglePlayPauseIcon()} size="2x" style={pointer} />
				<FontAwesomeIcon onClick={() => skipTrackHandler("skip-forward")} className="skip-forward" icon={faAngleRight} size="2x" style={pointer} />
			</PlayControlContainer>
		</PlayerContainer>
	);
};

const PlayerContainer = styled.div`
	min-height: 20vh;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-between;
`;

const TimeControlContainer = styled.div`
	margin-top: 5vh;
	width: 50%;
	display: flex;
	@media screen and (max-width: 768px) {
		width: 90%;
	}
`;

const Track = styled.div`
	background: ${(p) => p.currentSong && p.currentSong.color && p.currentSong.color.length > 1 ? `linear-gradient(to right, ${p.currentSong.color[0]}, ${p.currentSong.color[1]})` : 'lightblue'};
	width: 100%;
	height: 1rem;
	position: relative;
	border-radius: 1rem;
	overflow: hidden;
`;

const AnimateTrack = styled.div`
	background: rgb(204, 204, 204);
	width: 100%;
	height: 100%;
	position: absolute;
	top: 0;
	left: 0;
	transform: translateX(${p => Math.round((p.songInfo.currentTime * 100) / p.songInfo.duration || 0) + "%"});
	pointer-events: none;
`;

const Input = styled.input`
	width: 100%;
	-webkit-appearance: none;
	background: transparent;
	cursor: pointer;
	&:focus {
		outline: none;
		-webkit-appearance: none;
	}
	&::-webkit-slider-thumb {
		-webkit-appearance: none;
		height: 16px;
		width: 16px;
		background: transparent;
		border: none;
	}
`;

const P = styled.p`
	padding: 0 1rem 0 1rem;
	user-select: none;
`;

const PlayControlContainer = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1rem;
	width: 30%;
	@media screen and (max-width: 768px) {
		width: 60%;
	}
`;

export default Player;