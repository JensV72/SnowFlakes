let video;
let origFlakeImgs = [];
let resizedFlakes = [];
const flakeCount = 20;

let gridCells = 30;
const minCells = 30;
const minCellsPhone = 10;
const maxCells = 300;
const maxCellsPhone = 180;

let prevCellSize = -1;
let videoReady = false;

let lastTouchDist = 0;
let lastTouchY = null;

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

function preload() {
    // Load snowflakes
    for (let i = 1; i <= flakeCount; i++) {
        origFlakeImgs.push(loadImage(`assets/flake${i}.jpg`));
    }

    // Create video
    const videoSrc = isMobile
        ? "videos/balletMobile3.mp4"
        : "videos/ballet4.mp4";

    video = createVideo(videoSrc);
    video.attribute("playsinline", "");
    video.attribute("webkit-playsinline", "");
    video.attribute("muted", "");
    video.volume(0);
    video.hide();
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    imageMode(CENTER);

    sortFlakesByBrightness();
    resizedFlakes = origFlakeImgs.map(img => img.get());
}

function draw() {
    background(0);
    if (!videoReady) return;
    if (video.width === 0 || video.height === 0) return;

    video.loadPixels();
    if (!video.pixels || video.pixels.length < 4) return;

    let videoAspect = video.width / video.height;
    let canvasAspect = width / height;

    let drawW, drawH, offsetX, offsetY;

    if (canvasAspect > videoAspect) {
        drawH = height;
        drawW = drawH * videoAspect;
    } else {
        drawW = width;
        drawH = drawW / videoAspect;
    }

    if (isMobile) {
        const scaleFactor = 1.4;
        drawW *= scaleFactor;
        drawH *= scaleFactor;
        offsetX = (width - drawW) / 2 + drawW * 0.03;
        offsetY = (height - drawH) / 2 + drawH * 0.02;
    } else {
        offsetX = (width - drawW) / 2;
        offsetY = (height - drawH) / 2;
    }

    let cellSize = drawW / gridCells;
    let gridRows = floor(drawH / cellSize);

    if (cellSize !== prevCellSize) {
        resizedFlakes = origFlakeImgs.map(img => {
            let copy = img.get();
            copy.resize(cellSize, cellSize);
            return copy;
        });
        prevCellSize = cellSize;
    }

    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCells; col++) {
            let x = offsetX + col * cellSize + cellSize / 2;
            let y = offsetY + row * cellSize + cellSize / 2;

            let vx = floor(map(x - offsetX, 0, drawW, 0, video.width));
            let vy = floor(map(y - offsetY, 0, drawH, 0, video.height));

            let idx = (vy * video.width + vx) * 4;
            if (idx < 0 || idx + 2 >= video.pixels.length) continue;

            let bright = (
                video.pixels[idx] +
                video.pixels[idx + 1] +
                video.pixels[idx + 2]
            ) / 3;

            let imgIndex = floor(map(bright, 0, 255, 0, resizedFlakes.length));
            imgIndex = constrain(imgIndex, 0, resizedFlakes.length - 1);

            image(resizedFlakes[imgIndex], x, y);
        }
    }
}

// iOS REQUIRED: start video after click
function startVideoFromUserGesture() {
    if (!videoReady) {
        video.loop();
        videoReady = true;
    }
}
window.startVideoFromUserGesture = startVideoFromUserGesture;

function sortFlakesByBrightness() {
    let list = [];

    for (let img of origFlakeImgs) {
        img.loadPixels();
        let sum = 0;
        for (let i = 0; i < img.pixels.length; i += 4) {
            sum += (img.pixels[i] + img.pixels[i + 1] + img.pixels[i + 2]) / 3;
        }
        list.push(sum / (img.pixels.length / 4));
    }

    origFlakeImgs = origFlakeImgs
        .map((img, i) => ({ img, bright: list[i] }))
        .sort((a, b) => a.bright - b.bright)
        .map(o => o.img);
}

function mouseWheel(e) {
    if (windowWidth < 768) return;
    gridCells += e.deltaY * 0.02;
    gridCells = constrain(gridCells, minCells, maxCells);
    return false;
}

function touchMoved() {
    if (touches.length === 2) {
        let dx = touches[0].x - touches[1].x;
        let dy = touches[0].y - touches[1].y;
        let dist = sqrt(dx * dx + dy * dy);

        if (lastTouchDist > 0) {
            let delta = lastTouchDist - dist;
            gridCells += delta * 0.05;
            gridCells = constrain(gridCells, minCellsPhone, maxCellsPhone);
        }
        lastTouchDist = dist;
    } else if (touches.length === 1) {
        if (lastTouchY !== null) {
            let delta = lastTouchY - touches[0].y;
            gridCells += delta * 0.05;
            gridCells = constrain(gridCells, minCellsPhone, maxCellsPhone);
        }
        lastTouchY = touches[0].y;
    }
    return false;
}

function touchEnded() {
    lastTouchDist = 0;
    lastTouchY = null;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    prevCellSize = -1;
}
