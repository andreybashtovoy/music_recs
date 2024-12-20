import { v4 as uuidv4 } from "uuid";
function chillHop() {
	return [
		{
			name: "Beaver Creek",
			cover:
				"https://img-cdn.pixlr.com/image-generator/history/65bb506dcb310754719cf81f/ede935de-1138-4f66-8ed7-44bd16efc709/medium.webp",
			artist: "Aso, Middle School, Aviino",
			audio: "https://file-examples.com/storage/fef4e75e176737761a179bf/2017/11/file_example_MP3_1MG.mp3",
			color: ["#205950", "#2ab3bf"],
			id: uuidv4(),
			active: true,
		},
	];
}

export default chillHop;
