let currentsong = new Audio();
let songs;
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getsongs() {
    let a = await fetch("http://192.168.1.3:3000/songs/");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let songs = [];
    for (let i = 0; i < as.length; i++) {
        let element = as[i];
        if (element.href.endsWith("mp3")) {
            songs.push(element.href.split("/songs/")[1]);
        }
    }
    return songs;
}

async function main() {

    // Get the list of all the songs
    songs = await getsongs();
    playMusic(songs[0], true)

    // Show all the songs in the playlist
    let songUL = document.querySelector(".SongList").getElementsByTagName("ul")[0];
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                                <img class="invert" width="34" src="music.svg"  alt="">
                                <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                </div>
                                <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="play.svg" alt="">
                                </div>
                            </li>`;
    }
    Array.from(document.querySelector(".SongList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "play.svg"
        }
    })
    // Listen for Time Update event
    currentsong.addEventListener("timeupdate", () => {
        console.log(currentsong.currentTime, currentsong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}
        /${secondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime /
            currentsong.duration) * 100 + "%";

        // Add an Event Listener to seekbar
        document.querySelector(".seekbar").addEventListener("click", (e) => {
            let seekbar = e.currentTarget;
            let percent = (e.offsetX / seekbar.getBoundingClientRect().width) * 100;
            document.querySelector(".circle").style.left = percent + "%";
            currentsong.currentTime = (currentsong.duration * percent) / 100;
        });
    })
    return songs;
}
const playMusic = (track, pause = false) => {
    let audio = new Audio("/songs/" + track)
    currentsong.src = "/songs/" + track
    if (!pause) {
        currentsong.play();
        play.src = "pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}
// Add an event listener for query Selector
document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0"
})
// Add an query Selector for close button
document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%"
})

// ADD an event listener to previous
previous.addEventListener("click", () => {
    currentsong.pause()
    console.log("previous clicked");
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
    if ((index - 1) >= 0) {
        playMusic(songs[index - 1]);
    }
})

// ADD an event Listener to next
next.addEventListener("click", () => {
    currentsong.pause()
    console.log("next clicked");
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
    if ((index + 1) < songs.length) {
        playMusic(songs[index + 1]);
    }
})

// Add an event to volume
document.querySelector(".range").getElementsByTagName("input")["0"].addEventListener("change",
    (e) => {
        currentsong.volume = parseInt(e.target.value) / 100
    }
)

main();