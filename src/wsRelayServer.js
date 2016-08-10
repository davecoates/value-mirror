import WebSocket from 'ws';

export class WebSocketSerializerRelayServer {

    constructor(port) {
        const wss = new WebSocket.Server({ port });
        wss.on('connection', ws => {
            this.ws = ws;
            ws.on('message', this.onMessage);
        });
        this.wss = wss;
    }

    onMessage = (message:string) => {
        this.wss.clients.forEach(client => {
            if (client !== this) {
                client.send(message);
            }
        });
    }

}
