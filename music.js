const intro = document.getElementById("intro");
const button = document.getElementById("startBtn");
const music = document.getElementById("bg-music");
const muteBtn = document.getElementById("mute-btn");

let audioStarted = false;
let isMuted = false;
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

/* -----------------------
   iOS UI adjustments
----------------------- */
if (isIOS) {
    document.querySelectorAll(".ios-only").forEach(el => {
        el.style.display = "block";
    });
}

/* -----------------------
   AudioContext for iOS unlock
----------------------- */
let audioCtx;
if (isIOS) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const track = audioCtx.createMediaElementSource(music);
    track.connect(audioCtx.destination);
}

/* -----------------------
   MUTE BUTTON
----------------------- */
muteBtn.addEventListener("click", () => {
    if (!audioStarted) {
        startAudio(); // ensure audio starts
    }

    isMuted = !isMuted;
    music.muted = isMuted;
    muteBtn.src = isMuted ? "photos/mute.png" : "photos/sound.png";
});

/* -----------------------
   START AUDIO FUNCTION
----------------------- */
function startAudio() {
    if (audioStarted) return;

    // iOS unlock
    if (isIOS && audioCtx.state === "suspended") {
        audioCtx.resume();
    }

    music.muted = false;
    music.volume = 0.4;

    music.play()
        .then(() => {
            audioStarted = true;
        })
        .catch(err => {
            console.log("Audio play failed:", err);
        });
}

/* -----------------------
   START EXPERIENCE (button)
----------------------- */
function startExperience() {
    intro.classList.add("hidden");


    startAudio();

    if (window.startVideoFromUserGesture) {
        window.startVideoFromUserGesture();
    }

    if (!isIOS) {
        music.volume = 0;
        music.muted = false;
        music.play().then(() => {
            audioStarted = true;
        }).catch(() => {});

        let v = 0;
        const fade = setInterval(() => {
            v += 0.02;
            music.volume = Math.min(v, 0.4);
            if (v >= 0.4) clearInterval(fade);
        }, 100);
    }
}

button.addEventListener("click", startExperience);
