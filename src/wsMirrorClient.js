// @flow
import uuid from 'uuid';
import getEntries from './getEntries';
import getProperties from './getProperties';

import type { GetEntriesConfig } from './getEntries';
import type { RemoteObjectId } from './types';

const PROMISE_RESPONSE_TIMEOUT = 500;

export class WebSocketMirrorServer {

    id: string;
    ws: WebSocket;

    constructor(hostname:string, port:string|number) {
        this.id = uuid.v4();
        this.ws = new WebSocket(`ws://${hostname}:${port}`);
        this.ws.onmessage = this.onMessage;
    }

    send = (message:{}) => {
        this.ws.send(JSON.stringify({ ...message, source: this.id }));
    };

    onMessage = (messageEvent:MessageEvent) => {
        if (typeof messageEvent.data != 'string') {
            console.warn( // eslint-disable-line
                'Expected string data', messageEvent);
            return;
        }
        const message = JSON.parse(messageEvent.data);
        const { action, payload, id, source } = message;
        if (source === this.id) {
            return;
        }
        switch (action) {
            case 'getEntries': {
                const result = getEntries(payload.objectId, payload.iteratorId, payload.config);
                this.send({
                    action: 'getEntries',
                    payload: result,
                    id,
                });
                break;
            }
            case 'getProperties': {
                const result = getProperties(payload.objectId);
                this.send({
                    action: 'getProperties',
                    payload: result,
                    id,
                });
                break;
            }
            default:
                console.warn( // eslint-disable-line
                    'Unexpected message', message);
        }
    }

}

type RejectResolve = {
    reject: () => void;
    resolve: (object:{}) => void;
};

export default class WebSocketMirrorClient {

    id: string;
    ws: WebSocket;
    waitingResponse:Map<string, RejectResolve> = new Map();

    constructor(hostname:string, port:string|number) {
        this.id = uuid.v4();
        this.ws = new WebSocket(`ws://${hostname}:${port}`);
        this.ws.onmessage = this.onMessage;
    }

    onMessage = (messageEvent:MessageEvent) => {
        if (typeof messageEvent.data != 'string') {
            console.warn( // eslint-disable-line
                'Expected string data', messageEvent);
            return;
        }
        const message = JSON.parse(messageEvent.data);
        if (message.source === this.id) {
            return;
        }
        const { id, payload } = message;
        const response = this.waitingResponse.get(id);
        if (response) {
            response.resolve(payload);
        }
    };

    getEntries(
        objectId:RemoteObjectId, iteratorId:?number, config: ?GetEntriesConfig) : Promise<{}> {
        return this.send('getEntries', { objectId, iteratorId, config });
    }

    getProperties(objectId:RemoteObjectId) : Promise<{}> {
        return this.send('getProperties', { objectId });
    }

    send = (action:string, payload:{}) : Promise<{}> => {
        const id = uuid.v4();
        this.ws.send(JSON.stringify({
            source: this.id,
            action,
            payload,
            id,
        }));
        return Promise.race([
            new Promise((resolve, reject) => setTimeout(
                reject.bind(null, 'Timeout'), PROMISE_RESPONSE_TIMEOUT)),
            new Promise((resolve, reject) => {
                this.waitingResponse.set(id, { resolve, reject });
            }),
        ]);
    };

}
