const moment = require('moment-timezone');

function handleTZ(tz) {
    let offset;
    if (tz.toUpperCase() === 'UTC') {
        offset = '+00:00';
    } else {
        let match = tz.match(/GMT([+-]\d+)/i);
        if (match) {
            let hoursOffset = parseInt(match[1], 10);
            offset = (hoursOffset >= 0 ? '+' : '') + ('0' + Math.abs(hoursOffset)).slice(-2) + ':00';
        } else {
            return "Invalid";
        }
    }
    let currentTime = moment().utcOffset(offset).format('h:mma');
    return currentTime;
}

module.exports = { handleTZ };
