import getEntries from './getEntries';
import getProperties from './getProperties';

export default class {

    getEntries(objectId, iteratorId, config) {
        const entries = getEntries(
            objectId,
            iteratorId,
            config
        );
        return Promise.resolve(entries);
    }

    getProperties(objectId) {
        const properties = getProperties(objectId);
        return Promise.resolve(properties);
    }

}
