import roboarm from './roboarm.js';


function initRotate(main) {
    async function rotate(target, event) {
        const { clientX, clientY } = event;
        const maxWidth = target.clientWidth;
        const maxHeight = target.clientHeight;
        const rotate = roboarm.getValueFromRange(clientX, maxWidth);
        const upDown = roboarm.getValueFromRange(clientY, maxHeight);
        const iupDown = roboarm.inverse(upDown);
        roboarm.engines.rotate = rotate;
        roboarm.engines.up = iupDown;
        await roboarm.set(roboarm.engines);
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
        roboarm.engines.forward = current;
        await roboarm.set(roboarm.engines);
    });
}

function initKeep(main) {
    const rotateBox = main.querySelector('#RotateBox');
    rotateBox.addEventListener('mousedown', async function (event) {
        if (event.target != this) return;
        const release = (roboarm.engines.hold == roboarm.hold) ? roboarm.release : roboarm.hold;
        await roboarm.set({ hold: release });
    });
}

function initButtons(main) {
    let gTimeout = null;
    function update() {
        if (gTimeout != null) clearTimeout(gTimeout);
        gTimeout = setTimeout(function () {
            horz.value = roboarm.engines.rotate;
            vert.value = roboarm.engines.up;
            fwd.value = roboarm.engines.fwd;
            gTimeout = null;
        }, 500);
    }

    async function setHorz() {
        await roboarm.set({
            rotate: Number(horz.value),
            up: Number(vert.value),
            fwd: Number(fwd.value),
            masterEngine: 'fwd'
        });
        update();
    }

    async function setVert() {
        await roboarm.set({
            rotate: Number(horz.value),
            up: Number(vert.value),
            fwd: Number(fwd.value),
            masterEngine: 'up'
        });
        update();
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

    horz.onchange = setHorz;
    vert.onchange = setVert;
    fwd.onchange = setHorz;

    update();

    left.onclick = async () => {
        await roboarm.set({ rotate: 0 });
        update();
    };

    right.onclick = async () => {
        await roboarm.set({ rotate: 180 });
        update();
    };

    center.onclick = async () => {
        await roboarm.set({ rotate: 90 });
        update();
    };

    topVert.onclick = async () => {
        await roboarm.set({ up: 70, fwd: 170 });
        update();
    };

    bottom.onclick = async () => {
        await roboarm.set({ up: 180, fwd: 50 });
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
        await roboarm.set({ up: 0, fwd: 158, masterEngine: 'fwd' });
        update();
    };

    topHorz.onclick = async () => {
        await roboarm.set({ up: 0, fwd: 90 });
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