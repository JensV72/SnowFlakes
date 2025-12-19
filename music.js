const intro = document.getElementById("intro");
const button = document.getElementById("startBtn");
const music = document.getElementById("bg-music");
const muteBtn = document.getElementById("mute-btn");

let audioStarted = false;
let isMuted = false;


muteBtn.addEventListener("click", () => {
    
    if (!audioStarted) {
        music.volume = 0.4;
        music.play().then(() => {
            audioStarted = true;
        }).catch(() => {});
    }

    isMuted = !isMuted;
    music.muted = isMuted;

    muteBtn.src = isMuted
        ? "photos/mute.png"
        : "photos/sound.png";
});


function startExperience() {
    intro.classList.add("hidden");

    if (window.startVideoFromUserGesture) {
        window.startVideoFromUserGesture();
    }

    music.muted = false;
    music.volume = 0.4;

    music.play().then(() => {
        audioStarted = true;
    }).catch(e => {
        console.log("Audio play failed:", e);
    });
}


button.addEventListener("click", startExperience);
