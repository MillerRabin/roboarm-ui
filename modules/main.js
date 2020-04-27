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
        gEngines.hold = roboarm.hold;
        await roboarm.set(gEngines);
    });
    rotateBox.addEventListener('mouseup', async function (event) {
        gEngines.hold = roboarm.release;
        await roboarm.set(gEngines);
    });
}




function main() {
    const main = window.document.getElementById('Main');
    initRotate(main);
    initForwardBackWard(main);
    initKeep(main);
}

export default {
    main
}