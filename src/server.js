require('dotenv').config();
require("babel-core/register");
require("babel-polyfill");
import { TeamSpeak, QueryProtocol } from "ts3-nodejs-library";

const config = {
	host: process.env.HOST,
	protocol: QueryProtocol.RAW,
	queryport: process.env.QUERYPORT,
	serverport: process.env.SERVERPORT,
	username: process.env.SERVER_LOGIN,
	password: process.env.SERVER_PASSWORD,
	nickname: process.env.SERVER_NICKNAME,
};

const AFK_CHANNEL = 18;
const ARRAY_OF_CLIENTS = [];

function populateUsers(array) {
	array.forEach(client => {
		if(client.channelGroupInheritedChannelId !== AFK_CHANNEL) {
			ARRAY_OF_CLIENTS[client.databaseId] = client.channelGroupInheritedChannelId
		}
	});
}

function start() {

	const ts3 = new TeamSpeak(config);

	ts3.on("ready", async () => {
		Promise.all([
			ts3.registerEvent("server"),
			ts3.registerEvent("channel", 0),
			ts3.registerEvent("textserver"),
			ts3.registerEvent("textchannel"),
			ts3.registerEvent("textprivate")
		]).then(async () => {
			console.info("TS3 Bot started!");
			
			const ts3_clients = await ts3.clientList({ client_type: 0 });
			populateUsers(ts3_clients);
	
		}).catch(e => {
			console.error("Could not register event handlers!");
			console.error(e.message);
			process.exit(1);
		});
	});

	// Check every second if any client is muted or unmuted
	setInterval(async () => {

		const ts3_clients = await ts3.clientList({ client_type: 0 });
		
		ts3_clients.forEach(ts3_client => {
		
			// Client muted and isnt AFK Channel
			if(ts3_client.outputMuted === 1 && ts3_client.channelGroupInheritedChannelId !== AFK_CHANNEL) {
				
				// Move client to AFK CHANNEL
				if(ARRAY_OF_CLIENTS[ts3_client.databaseId] !== undefined) {
					ts3_client.move(AFK_CHANNEL);
					ts3_client.message("\nFoste movido para o AFK! \nPara voltar para o channel anterior dá unmute \nBy: Sekoia Lindo <3");
				}
			}
	
			// Client unmuted and is AFK Channel
			if(ts3_client.outputMuted === 0 && ts3_client.channelGroupInheritedChannelId === AFK_CHANNEL) {

				// Move client to the previous channel before going to AFK channel
				if(ARRAY_OF_CLIENTS[ts3_client.databaseId] !== undefined) {
					ts3_client.move(ARRAY_OF_CLIENTS[ts3_client.databaseId]);
				}
			}

		});

	}, 1500);
	
	ts3.on("clientmoved", event => {

		// Track the channel when the client move to another channel
		if(event.client.channelGroupInheritedChannelId !== AFK_CHANNEL) {
			ARRAY_OF_CLIENTS[event.client.databaseId] = event.client.channelGroupInheritedChannelId;
		}

	});
	
	ts3.on("error", error => console.log("Something went wrong! \nError: "+ error));
	ts3.on("close", () => console.log("Connection lost!"));

}

start();
