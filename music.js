const intro = document.getElementById("intro");
const button = document.getElementById("startBtn");
const music = document.getElementById("bg-music");
const muteBtn = document.getElementById("mute-btn");

let isMuted = false;

// mute/unmute
muteBtn.addEventListener("click", () => {
    isMuted = !isMuted;
    music.muted = isMuted;
    muteBtn.src = isMuted ? "photos/mute.png" : "photos/sound.png";
});

button.addEventListener("click", () => {

    intro.classList.add("hidden");


    if (window.startVideoFromUserGesture) window.startVideoFromUserGesture();

    music.muted = false;
    music.volume = 0.4;
    music.play();
});
