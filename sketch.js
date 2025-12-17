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

// Mobile zoom variables
let lastTouchDist = 0;
let lastTouchY = null;

// Detect mobile
const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);

function preload() {
    // Load snowflake images
    for (let i = 1; i <= flakeCount; i++) {
        origFlakeImgs.push(loadImage(`assets/flake${i}.jpg`));
    }

    // Load different video for mobile
    if (isMobile) {
        video = createVideo("videos/balletMobile3.mp4", () => {
            video.volume(0);
            video.loop();
            videoReady = true;
        });
    } else {
        video = createVideo("videos/ballet4.mp4", () => {
            video.volume(0);
            video.loop();
            videoReady = true;
        });
    }

    video.attribute("playsinline", "");
    video.attribute("muted", "");
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    imageMode(CENTER);

    video.hide();

    sortFlakesByBrightness();
    resizedFlakes = origFlakeImgs.map(img => img.get());
}

function draw() {
    background(0);

    if (!video || video.width === 0 || video.height === 0) return;

    video.loadPixels();
    if (video.pixels.length < 4) return;

    // --- Maintain video aspect ratio ---
    let videoAspect = video.width / video.height;
    let canvasAspect = width / height;

    let drawW, drawH, offsetX, offsetY;

    if (canvasAspect > videoAspect) {
        // canvas wider → fit height
        drawH = height;
        drawW = drawH * videoAspect;
    } else {
        // canvas taller → fit width
        drawW = width;
        drawH = drawW / videoAspect;
    }

    // --- Mobile adjustment: scale up & shift down ---
    if (isMobile) {
        const scaleFactor = 1.40;  // make video bigger
        drawW *= scaleFactor;
        drawH *= scaleFactor;

        offsetX = (width - drawW) / 2 + drawW * 0.03;
        offsetY = (height - drawH) / 2 + drawH * 0.02; // shift down 10% of video height
    } else {
        offsetX = (width - drawW) / 2;
        offsetY = (height - drawH) / 2;
    }

    // --- Grid calculation ---
    let cellSize = drawW / gridCells;
    let gridRows = floor(drawH / cellSize);

    // Resize flakes only when needed
    if (cellSize !== prevCellSize) {
        resizedFlakes = origFlakeImgs.map(img => {
            let copy = img.get();
            copy.resize(cellSize, cellSize);
            return copy;
        });
        prevCellSize = cellSize;
    }

    // --- Draw grid ---
    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCells; col++) {
            let x = offsetX + col * cellSize + cellSize / 2;
            let y = offsetY + row * cellSize + cellSize / 2;

            let vx = floor(map(x - offsetX, 0, drawW, 0, video.width));
            let vy = floor(map(y - offsetY, 0, drawH, 0, video.height));

            let pixelIndex = (vy * video.width + vx) * 4;
            if (pixelIndex < 0 || pixelIndex + 2 >= video.pixels.length) continue;

            let r = video.pixels[pixelIndex];
            let g = video.pixels[pixelIndex + 1];
            let b = video.pixels[pixelIndex + 2];

            let bright = (r + g + b) / 3;

            let imgIndex = floor(map(bright, 0, 255, 0, resizedFlakes.length));
            imgIndex = constrain(imgIndex, 0, resizedFlakes.length - 1);

            image(resizedFlakes[imgIndex], x, y);
        }
    }
}

// --------------------
// Brightness sorting
// --------------------
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

// --------------------
// Desktop scroll zoom
// --------------------
function mouseWheel(e) {
    if (windowWidth < 768) return; // disable on mobile
    gridCells += e.deltaY * 0.02;
    gridCells = constrain(gridCells, minCells, maxCells);
    return false;
}

// --------------------
// Mobile pinch/drag zoom
// --------------------
function touchMoved() {
    if (touches.length === 2) {
        // pinch zoom
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
        // vertical drag zoom
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

// --------------------
function windowResized() {
    resizeCanvas(window.innerWidth, window.innerHeight);
    prevCellSize = -1; // force re-resize flakes
}
