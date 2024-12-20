// Library.js

import React from "react";
import LibrarySong from "./LibrarySong";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const Library = ({ songs, setCurrentSong, audioRef, isPlaying, setSongs, libraryStatus, setLibraryStatus }) => {
	return (
		<LibraryContainer libraryStatus={libraryStatus}>
			<LibraryHeader>
				<H1>Library</H1>
				<CloseButton onClick={() => setLibraryStatus(false)}>
					<FontAwesomeIcon icon={faTimes} />
				</CloseButton>
			</LibraryHeader>
			<SongContainer>
				{songs.map((song) => (
					<LibrarySong
						song={song}
						songs={songs}
						setCurrentSong={setCurrentSong}
						key={song.id}
						audioRef={audioRef}
						isPlaying={isPlaying}
						setSongs={setSongs}
					/>
				))}
			</SongContainer>
		</LibraryContainer>
	);
};

const LibraryContainer = styled.div`
	position: fixed;
	z-index: 9;
	top: 0;
	left: 0;
	width: 20rem;
	height: 100%;
	background-color: white;
	box-shadow: 2px 2px 50px rgb(204, 204, 204);
	user-select: none;
	overflow: scroll;
	transform: translateX(${(p) => (p.libraryStatus ? "0%" : "-100%")});
	transition: all 0.5s ease;
	opacity: ${(p) => (p.libraryStatus ? "100" : "0")};
	scrollbar-width: thin;
	scrollbar-color: rgba(155, 155, 155, 0.5) tranparent;
	&::-webkit-scrollbar {
		width: 5px;
	}
	&::-webkit-scrollbar-track {
		background: transparent;
	}
	&::-webkit-scrollbar-thumb {
		background-color: rgba(155, 155, 155, 0.5);
		border-radius: 20px;
		border: transparent;
	}
	@media screen and (max-width: 768px) {
		width: 100%;
		z-index: 9;
	}
`;

const LibraryHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 2rem;
	padding-bottom: 0;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.5rem;
    color: #777;
    padding: 0.5rem;
    transition: all 0.3s ease;
    
    &:hover {
        color: #333;
        transform: scale(1.1);
    }

    @media screen and (min-width: 769px) {
        display: none;
    }
`;

const SongContainer = styled.div`
    display: flex;
    flex-direction: column;
    background-color: white;
`;

const H1 = styled.h2`
    padding-bottom: 2rem;
`;

export default Library;