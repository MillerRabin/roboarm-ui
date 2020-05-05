import roboarm from './roboarm.js';

let gEngines = roboarm.getStartParameters();


function initRotate(main) {
    async function rotate(target, event) {
        const { clientX, clientY } = event;
        const maxWidth = target.clientWidth;
        const maxHeight = target.clientHeight;
        const rotate = roboarm.getValueFromRange(clientX, maxWidth);
        const upDown = roboarm.getValueFromRange(clientY, maxHeight);
        const iupDown = roboarm.inverse(upDown);
        gEngines.rotate = rotate;
        gEngines.up = iupDown;
        await roboarm.set(gEngines);
    }

    const rotateBox = main.querySelector('#RotateBox');
    let rTimeout = null;
    rotateBox.addEventListener('mousemove', function (event) {
        if (rTimeout != null) return;
        rTimeout = setTimeout(async () => {
            try {
                await rotate(this, event);
            } finally {
                rTimeout = null;
            }
        }, 50);
    });
}


function initForwardBackWard(main) {
    const rotateBox = main.querySelector('#RotateBox');
    const { min, max } = roboarm.getBounds();
    let current = min;
    rotateBox.addEventListener('mousewheel', async function (event) {
        const { deltaY } = event;
        current += deltaY;
        if (current < min) current = min;
        if (current > max) current = max;
        gEngines.forward = current;
        await roboarm.set(gEngines);
    });
}

function initKeep(main) {
    const rotateBox = main.querySelector('#RotateBox');
    rotateBox.addEventListener('mousedown', async function (event) {
        if (event.target != this) return;
        gEngines.hold = roboarm.hold;
        await roboarm.set(gEngines);
    });
    rotateBox.addEventListener('mouseup', async function (event) {
        if (event.target != this) return;
        gEngines.hold = roboarm.release;
        await roboarm.set(gEngines);
    });
}

function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(() => {
            return resolve()
        }, ms)
    });
}

function deadZone(val) {
    const threshold = 10;
    const hLimit = 180 - threshold;
    if (val > hLimit) return hLimit;
    if (val < threshold) return threshold;
    return val;
}

function alleviate(sStart, sEnd, dStart, dEnd) {
    const delta = Math.abs(dEnd - dStart);
    const mPath = Math.trunc((sEnd - sStart) / 2);
    const maxDelta = 60
    if (delta < maxDelta) return deadZone(sStart);
    const finish = sStart + mPath;
    return deadZone(finish);
}


async function command({ rotate = gEngines.rotate,
                   up = gEngines.up,
                   fwd = gEngines.fwd,
                   hold = gEngines.hold
                 }) {
    /*const nUp = alleviate(gEngines.up, up, gEngines.fwd, fwd);
    const nFwd = alleviate(gEngines.fwd, fwd, gEngines.up, up);*/
    const nUp = deadZone(gEngines.up);
    const nFwd = deadZone(gEngines.fwd);
    if ((nUp != gEngines.up) || (nFwd != gEngines.fwd)) {
        gEngines.up = nUp;
        gEngines.fwd = nFwd;
        await roboarm.set(gEngines);
        await wait(200);
    }

    gEngines.rotate = rotate;
    gEngines.up = up;
    gEngines.fwd = fwd;
    gEngines.hold = hold;
    await roboarm.set(gEngines);
    await wait(300);
}

function initButtons(main) {
    function update() {
        horz.value = gEngines.rotate;
        vert.value = gEngines.up;
        fwd.value = gEngines.fwd;
    }

    async function set() {
        gEngines.rotate = horz.value;
        gEngines.up = vert.value;
        gEngines.fwd = fwd.value;
        await roboarm.set(gEngines);
    }

    const left = main.querySelector('.buttons .left');
    const center = main.querySelector('.buttons .center');
    const right = main.querySelector('.buttons .right');
    const topVert = main.querySelector('.buttons .top.vert');
    const bottom = main.querySelector('.buttons .bottom');
    const forward = main.querySelector('.buttons .forward');
    const backward = main.querySelector('.buttons .backward');
    const sleep = main.querySelector('.buttons .sleep');
    const topHorz = main.querySelector('.buttons .top.horz');

    const horz = main.querySelector('.inputs .horz');
    const vert = main.querySelector('.inputs .vert');
    const fwd = main.querySelector('.inputs .fwd');

    horz.onchange = set;
    vert.onchange = set;
    fwd.onchange = set;

    update();

    left.onclick = async () => {
        await command({ rotate: 0 });
        update();
    };

    right.onclick = async () => {
        await command({ rotate: 180 });
        update();
    };

    center.onclick = async () => {
        await command({ rotate: 90 });
        update();
    };

    topVert.onclick = async () => {
        await command({ up: 70, fwd: 170 });
        update();
    };

    bottom.onclick = async () => {
        await command({ up: 180, fwd: 50 });
        update();
    };

    forward.onclick = async () => {
        await command({ up: 70, fwd: 70 });
        update();
    };

    backward.onclick = async () => {
        await command({ fwd: 180 });
        update();
    };

    sleep.onclick = async () => {
        await command({ up: 0, fwd: 158 });
        update();
    };

    topHorz.onclick = async () => {
        await command({ up: 0, fwd: 90 });
        update();
    };
}


function main() {
    const main = window.document.getElementById('Main');
    //initRotate(main);
    //initForwardBackWard(main);
    initKeep(main);
    initButtons(main);
}

export default {
    main
}