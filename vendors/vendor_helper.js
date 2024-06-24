const hourInMilli = 3600000;

exports.canMakeCall = function(callHistory, rateLimit) {
    // Rate limit has not yet been reached
    if (rateLimit === -1 || callHistory.length < rateLimit) {
        return true;
    }

    // Rate limit reached, check to see if earliest call is an hour or more ago
    if (callHistory[0] <= Date.now() - hourInMilli) {
        // Earliest call was an hour or more ago, remove from history and allow this request
        callHistory.shift();
        return true;
    }

    // Disallow making this request as it will exceed the rate limit
    return false;
}