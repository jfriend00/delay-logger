// logging function to output progress every so often based on timeout
// so you see regular progress, but don't overwhelm the console
// You can call getLogger() multiple times to get separate loggers with
// separate timing and triggers
function getLogger(delay = 1000, skipInitial = true) {
    // args here are passed directly to console.log
    let lastOutputTime = 0;
    let pendingOutput;               // array of arguments for console.log()
    let pendingTimer;                // timer for next output

    const fn = function(...args) {
        if (skipInitial && lastOutputTime === 0) {
            lastOutputTime = Date.now();
        }
        // if we haven't sent anything in awhile, just send this one now
        let now = Date.now();
        if (now - lastOutputTime > delay) {
            console.log(...args);
            if (pendingTimer) {
                clearTimeout(pendingTimer);
                pendingTimer = null;
                pendingOutput = null;
            }
            lastOutputTime = now;
        } else {
            // we did send some logging recently, so queue this
            // this will overwrite any previous output
            // if there's a timer, keep it running
            // if no timer, set a new one, based on lastOutputTime
            pendingOutput = args;
            if (!pendingTimer) {
                pendingTimer = setTimeout(() => {
                    // delay time has past since any output was sent
                    fn.flush();
                }, now - lastOutputTime + delay);
            }
        }
    }

    // clear any pending output
    fn.flush = function() {
        if (pendingTimer) {
            clearTimeout(pendingTimer);
            pendingTimer = null;
        }
        if (pendingOutput) {
            console.log(...pendingOutput);
            pendingOutput = null;
        }
        lastOutputTime = Date.now();
    }

    // flush, then output this log msg right now
    fn.now = function(...args) {
        fn.flush();
        console.log(...args);
    }

    fn.debug = function(flag, ...args) {
        if (process.env[flag]) {
            fn(...args);
        }
    }

    return fn;
}

module.exports = { getLogger };
