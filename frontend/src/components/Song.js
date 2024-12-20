import React from "react";
import styled from "styled-components";

const Song = ({ currentSong }) => {
	return (
		<SongContainer>
			<SongCover src={currentSong.cover} alt={currentSong.name} />
			<SongDescription>
				<H1>{currentSong.name}</H1>
				<H2>{currentSong.artist}</H2>
			</SongDescription>
		</SongContainer>
	);
};

const SongContainer = styled.div`
	min-height: 20vh;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
`;

const SongCover = styled.img`
	border-radius: 50%;
	width: 20%;
	@media screen and (max-width: 768px) {
		width: 50%;
	}
`;

const SongDescription = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
`;

const H1 = styled.h2`
	font-size: 1.5rem;
	padding: 1rem;
`;

const H2 = styled.h3`
  font-size: 1rem;
  padding-bottom: 1rem;
`;

export default Song;