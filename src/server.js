require('dotenv').config();
import { TeamSpeak, QueryProtocol } from "ts3-nodejs-library";

var config = {
	host: process.env.HOST,
	protocol: QueryProtocol.RAW,
	queryport: process.env.QUERYPORT,
	serverport: process.env.SERVERPORT,
	username: process.env.SERVER_LOGIN,
	password: process.env.SERVER_PASSWORD,
	nickname: process.env.SERVER_NICKNAME,
}

const teamspeak = new TeamSpeak(config);

teamspeak.on("ready", async () => {
	console.log("Connected!");
})

teamspeak.on("error", (error) => {
	console.log("Something went wrong! \nError: "+ error);
});
