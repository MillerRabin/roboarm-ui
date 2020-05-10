const endpoint = 'http://192.168.0.27';

const fwdTable = [
    [[50, 100], [110, 180]],  //0
    [[110, 170]],             //10
    [[90, 180]],              //20
    [[80, 170]],              //30
    [[0, 0], [60, 180]],      //40
    [[0, 0], [60, 173]],      //50
    [[0, 0], [50, 175]],      //60
    [[0, 10], [30, 175]],     //70
    [[0, 20], [30, 175]],     //80
    [[0, 15], [20, 175]],     //90
    [[0, 175]],               //100
    [[30, 175]],              //110
    [[40, 175]],              //120
    [[40, 160]],              //130
    [[40, 160]],              //140
    [[30, 150]],              //150
    [[40, 150]],              //160
    [[40, 140]],              //170
    [[40, 130]]               //180
];

const vertTable = [
    [[110, 120]],             //0
    [[90, 110]],              //10
    [[90, 100]],              //20
    [[60, 100]],              //30
    [[60, 100], [150, 180]],  //40
    [[50, 80], [150, 180]],   //50
    [[45, 180]],  //60
    [[40, 180]],  //70
    [[30, 180]],  //80
    [[0, 20], [30, 180]],  //90
    [[0, 20], [30, 180]],   //100
    [[0, 20], [30, 180]],   //110
    [[0, 180]],   //120
    [[0, 180]],   //130
    [[0, 180]],   //140
    [[0, 160]],   //150
    [[0, 160]],   //160
    [[0, 130]],               //170
    [[40, 130]]               //180
];

function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(() => {
            return resolve()
        }, ms)
    });
}

const gEngines = getStartParameters();

function findEntry(entries, current) {
    let cEntry = entries[0];
    let gCurVal = null;

    for (const entry of entries) {
        const [min, max] = entry;
        if ((current >= min) && (current <= max)) return entry;
        const dMin = Math.abs(current - min);
        const dMax = Math.abs(max - current);
        const aMin = Math.min(dMin, dMax);
        if ((gCurVal == null) || (aMin < gCurVal)) {
            gCurVal = aMin;
            cEntry = entry;
        }
    }

    return cEntry;
}

function getAvailableDelta(table, current, value) {
    if (isNaN(value)) throw new Error('value is NaN');
    if ((value < 0) || (value > 180)) throw new Error('value out of range');
    const index = Math.trunc(current / 10);
    const entries = table[index];
    if (entries == null) throw new Error('Out of bounds');
    return findEntry(entries, value);
}

function getNearestValue(entry, value) {
    const [min, max] = entry
    if ((value >= min) && (value <= max)) return value;
    const dMin = Math.abs(value - min);
    const dMax = Math.abs(max - value);
    if (dMin <= dMax) return min;
    return max;
}

function getAccessibleEntry(entries, source, target) {
    for (const entry of entries) {
        const [min, max] = entry;
        if ((target >= min) && (target <= max) &&
            (source >= min) && (source <= max)) return entry;
    }
    return null;
}


function getAvailableValues(table, source, target) {
    const res = [];
    for (let i = 0; i < table.length; i++) {
        const entries = table[i];
        const entry = getAccessibleEntry(entries, source, target);
        if (entry != null)
            res.push(i * 10);
    }
    return res;
}

function adjustValue(table, source, target, value) {
    const values = getAvailableValues(table, source, target);
    if (values.length == 0) throw new Error('The target is no available');
    let cMin = null;
    let currentVal = null;
    for (const tValue of values) {
        const tMin = Math.abs(tValue - value);
        if ((currentVal == null) || (tMin < cMin)) {
            cMin = tMin;
            currentVal = tValue;
        }
    }
    return currentVal;
}

async function set({ rotate = gEngines.rotate,
                     up = gEngines.up,
                     fwd = gEngines.fwd,
                     hold = gEngines.hold
}) {
    let cUp = gEngines.up;
    let cFwd = gEngines.fwd;

    for (let i = 0; i < 7; i++) {
        const fwdEntry = getAvailableDelta(fwdTable, cUp, cFwd);
        const upEntry = getAvailableDelta(vertTable, cFwd, cUp);
        cUp = getNearestValue(upEntry, up);
        cFwd = getNearestValue(fwdEntry, fwd);
        if (cFwd != fwd)
            cUp = adjustValue(fwdTable, cFwd, fwd, cUp);
        if (cUp != up)
            cFwd = adjustValue(vertTable, cUp, up, cFwd);

        await send({ rotate, up: cUp, fwd: cFwd, hold });
        await wait(300);
        if ((cUp == up) && (cFwd == fwd))
            break;
    }
    return gEngines;
}

async function send({ rotate, up, fwd, hold }) {
    try {
        await fetch(`${endpoint}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `rotate=${rotate}&up=${up}&fwd=${fwd}&hold=${hold}`
        });
        gEngines.up = up;
        gEngines.fwd = fwd;
        gEngines.rotate = rotate;
        gEngines.hold = hold;
    } catch (e) {}
}

function getStartParameters() {
    return {
        rotate: 90,
        up: 0,
        fwd: 158,
        hold: 0
    }
}

export default {
    engines: gEngines,
    set,
    hold: 30,
    release: 0
}