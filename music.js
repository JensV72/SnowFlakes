const intro = document.getElementById("intro");
const button = document.getElementById("startBtn");
const music = document.getElementById("bg-music");
const muteBtn = document.getElementById("mute-btn");

let isMuted = false;

// Mute/unmute button
muteBtn.addEventListener("click", () => {
    isMuted = !isMuted;
    music.muted = isMuted;

    // Swap the icon
    if (isMuted) {
        muteBtn.src = "photos/mute.png";
    } else {
        muteBtn.src = "photos/sound.png";
    }
});

// Start button
function startExperience() {
    intro.classList.add("hidden");

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


