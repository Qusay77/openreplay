let PROJECT_KEY_LENGTH = parseInt(process.env.PROJECT_KEY_LENGTH) || 20;
let debug = process.env.debug === "1" || false;
const extractPeerId = (peerId) => {
    let splited = peerId.split("-");
    if (splited.length !== 2) {
        debug && console.error(`cannot split peerId: ${peerId}`);
        return {};
    }
    if (PROJECT_KEY_LENGTH > 0 && splited[0].length !== PROJECT_KEY_LENGTH) {
        debug && console.error(`wrong project key length for peerId: ${peerId}`);
        return {};
    }
    return {projectKey: splited[0], sessionId: splited[1]};
};
const request_logger = (identity) => {
    return (req, res, next) => {
        debug && console.log(identity, new Date().toTimeString(), 'REQUEST', req.method, req.originalUrl);
        res.on('finish', function () {
            if (this.statusCode !== 200 || debug) {
                console.log(new Date().toTimeString(), 'RESPONSE', req.method, req.originalUrl, this.statusCode);
            }
        })

        next();
    }
};
const isValidSession = function (sessionInfo, filters) {
    let foundAll = true;
    for (const [key, values] of Object.entries(filters)) {
        let found = false;
        for (const [skey, svalue] of Object.entries(sessionInfo)) {
            if (skey.toLowerCase() === key.toLowerCase()) {
                for (let v of values) {
                    if (svalue.toLowerCase().indexOf(v.toLowerCase()) >= 0) {
                        found = true;
                        break;
                    }
                }
                if (found) {
                    break;
                }
            }
        }
        foundAll &&= found;
        if (!found) {
            break;
        }
    }
    return foundAll;
}
const hasFilters = function (filters) {
    return filters !== undefined && Object.keys(filters).length > 0;
}
module.exports = {
    extractPeerId, request_logger, isValidSession, hasFilters
};