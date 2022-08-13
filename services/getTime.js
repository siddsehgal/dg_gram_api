const request = require("request");

function getTime() {
    request({
        method: 'GET',
        uri: 'http://worldtimeapi.org/api/timezone/Asia/Kolkata',
    }, async function (error, response, body) {
        return await JSON.parse(body).datetime
    })
}

module.exports = getTime
