const endpoint = 'http://192.168.0.27';

async function set(engines) {
    try {
        await fetch(`${endpoint}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `rotate=${engines.rotate}&up=${engines.up}&fwd=${engines.fwd}&hold=${engines.hold}`
        });
    } catch (e) {}
}

function getStartParameters() {
    return {
        rotate: 90,
        up: 30,
        fwd: 30,
        hold: 0
    }
}

export default {
    set,
    getStartParameters,
    hold: 30,
    release: 0
}