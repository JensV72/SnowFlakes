const intro = document.getElementById("intro");
const button = document.getElementById("startBtn");
const music = document.getElementById("bg-music");
const muteBtn = document.getElementById("mute-btn");

let isMuted = false;

muteBtn.addEventListener("click", () => {
    isMuted = !isMuted;
    music.muted = isMuted;
    muteBtn.src = isMuted ? "photos/mute.png" : "photos/sound.png";
});

function startExperience() {
    intro.classList.add("hidden");

    // START VIDEO (iOS fix)
    if (window.startVideoFromUserGesture) {
        window.startVideoFromUserGesture();
    }

    music.volume = 0;
    music.play();

    let v = 0;
    const fade = setInterval(() => {
        v += 0.02;
        music.volume = Math.min(v, 0.4);
        if (v >= 0.4) clearInterval(fade);
    }, 100);
}

button.addEventListener("click", startExperience);
