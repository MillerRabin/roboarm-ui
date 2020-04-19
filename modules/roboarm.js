const endpoint = 'http://192.168.0.21';
const eRotate = 4;
const eUpDown = 1;
const eForwardBackward = 2;
const eKeep = 3;
const COUNT_LOW = 1638;
const COUNT_HIGH = 7864;
const WIDTH = COUNT_HIGH - COUNT_LOW;

async function rotate(value) {
    try {
        await fetch(`${endpoint}?${eRotate}:${value}`);
    } catch (e) {}
}

async function upDown(value) {
    try {
        await fetch(`${endpoint}?${eUpDown}:${value}`);
    } catch (e) {}
}

async function forwardBackward(value) {
    try {
        await fetch(`${endpoint}?${eForwardBackward}:${value}`);
    } catch (e) {}
}

async function hold() {
    try {
        await fetch(`${endpoint}?${eKeep}:${2850}`);
    } catch (e) {}
}

async function release() {
    try {
        await fetch(`${endpoint}?${eKeep}:${2000}`);
    } catch (e) {}
}

function getValueFromRange(current, max) {
    const step = max / WIDTH;
    return Math.trunc(current / step + COUNT_LOW);
}

function inverse(value) {
    return Math.abs(value - COUNT_HIGH - COUNT_LOW);
}

function getBounds() {
    return {
        min: COUNT_LOW,
        max: COUNT_HIGH
    };
}

export default {
    rotate,
    upDown,
    forwardBackward,
    hold,
    release,
    getValueFromRange,
    inverse,
    getBounds
}