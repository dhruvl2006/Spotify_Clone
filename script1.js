let currentSong = new Audio();
let songsInfo=[];
let songs = [];
let currfolder;
let selectedSongIndex = 0;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currfolder = folder;
  try {
    let response = await fetch(folder);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    let textResponse = await response.text();
    let div = document.createElement("div");
    div.innerHTML = textResponse;
    let as = div.getElementsByTagName("a");

    songs = [];

    for (let index = 0; index < as.length; index++) {
      const element = as[index];
      if (element.href.endsWith(".mp3")) {
        songs.push(decodeURIComponent(element.href.split(`/${folder}/`)[1]));
      }
    }

    let songUL = document.querySelector(".songList ul");
    if (!songUL) {
      throw new Error("Could not find the song list UL element.");
    }

    songUL.innerHTML = "";

    songs.forEach((song) => {
      songUL.innerHTML += `
        <li>
          <img class="invert" width="34" src="Images/music.svg" alt="">
          <div class="info">
            <div>${song.replace(/%20/g, " ").replace(".mp3", "")}</div>
            <div>${folder.replace("songs/", "").replace(/%20/g, " ")}</div>
          </div>
          <div class="playnow">
            <span>Play Now</span>
            <img src="Images/play.svg" alt="">
          </div>
        </li>`;
    });

    Array.from(songUL.getElementsByTagName("li")).forEach((li, index) => {
      li.addEventListener("click", () => {
        playMusic(songs[index]);
      });
    });

    return songs;
  } catch (error) {
    console.error("Failed to fetch songs:", error);
    return [];
  }
}

const playMusic = async (track, pause = false) => {
  selectedSong = songs.indexOf(track);
  currentSong.src = `/${currfolder}/${track}`;
  await songTab(songs[selectedSong]);
  if (!pause) {
    currentSong.play();
    document.getElementById("play").src = "Images/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(
    track.replace(".mp3", "")
  );
  document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
  document.querySelector(".current").innerHTML = "00:00";
  document.querySelector(".total").innerHTML = "00:00";
};

async function displayAlbums() {
  try {
    let response = await fetch(`./songs/`);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    let textResponse = await response.text();
    let div = document.createElement("div");
    div.innerHTML = textResponse;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
      const e = array[index];

      if (e.href.includes("/songs/")) {
        let folder = e.href.split("/").slice(-2, -1)[0];
        let a = await fetch(`./songs/${folder}/info.json`);
        if (!a.ok) continue;

        let response = await a.json();
        
        cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
                <div class="play">
                  <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="35,20 75,50 35,80" fill="black" />
                  </svg>
                </div>
                <img src="./songs/${folder}/cover.jpg" alt="" />
                <div class="extra">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
                </div>
              </div>`;
              songsInfo.push(response);
      }
    }

    Array.from(document.getElementsByClassName("card")).forEach((e) => {
      e.addEventListener("click", async () => {
        songs = await getSongs(`songs/${e.dataset.folder}`);
        playMusic(songs[0]);
      });
    });
  } catch (error) {
    console.error("Failed to fetch albums:", error);
  }
}

async function songTab() {
  try {
    // Fetch the info.json for the given folder
    let response = await fetch(`./songs/${folder}/info.json`);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    let songInfoData = await response.json();
    let songInfo = document.querySelector(".songInfo");

    console.log("Song info", songInfo);
    console.log("Current song:", song, "\nResponse:", songInfoData);

    // Update the song info display
    songInfo.innerHTML = `<div data-folder="${folder}" class="songInfo">
      <h2>${songInfoData.title}</h2>
      <p>${songInfoData.description}</p>
    </div>`;
  } catch (error) {
    console.error("Failed to fetch song tabs:", error);
  }
}

async function main() {
  try {
    songs = await getSongs("songs/Devotional");
    if (songs.length > 0) {
      playMusic(songs[0], true);
    }

    displayAlbums();
    await songTab();

    const playButton = document.getElementById("play");
    const previousButton = document.getElementById("previous");
    const nextButton = document.getElementById("next");
    const playButton_2 = document.getElementById("play-2");
    const previousButton_2 = document.getElementById("previous-2");
    const nextButton_2 = document.getElementById("next-2");

    playButton.addEventListener("click", togglePlay);
    playButton_2.addEventListener("click", togglePlay);
    
    function togglePlay() {
      if (currentSong.paused) {
        currentSong.play();
        playButton.src = "Images/pause.svg";
        playButton_2.src = "Images/pause.svg";
      } else {
        currentSong.pause();
        playButton.src = "Images/play.svg";
        playButton_2.src = "Images/play.svg";
      }
    }
    
    previousButton_2.addEventListener("click", () => {
      currentSong.pause();
      let index = songs.indexOf(decodeURI(currentSong.src.split("/").slice(-1)[0]));
      if (index > 0) {
        playMusic(songs[index - 1]);
      } else {
        playMusic(songs[songs.length - 1]);
      }
    });

    nextButton_2.addEventListener("click", () => {
      currentSong.pause();
      let index = songs.indexOf(decodeURI(currentSong.src.split("/").slice(-1)[0]));
      if (index < songs.length - 1) {
        playMusic(songs[index + 1]);
      } else {
        playMusic(songs[0]);
      }
    });

    document.querySelector(".range-2 input").addEventListener("input", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
      if (currentSong.volume > 0) {
        document.querySelector(".volume-2 img").src = "Images/volume.svg";
      } else {
        document.querySelector(".volume-2 img").src = "Images/mute.svg";
      }
    });

    document.querySelector(".volume-2 img").addEventListener("click", () => {
      if (currentSong.volume > 0) {
        currentSong.volume = 0;
        document.querySelector(".range-2 input").value = 0;
        document.querySelector(".volume-2 img").src = "Images/mute.svg";
      } else {
        currentSong.volume = 0.5;
        document.querySelector(".range-2 input").value = 50;
        document.querySelector(".volume-2 img").src = "Images/volume.svg";
      }
    });

    currentSong.addEventListener("timeupdate", () => {
      document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
      document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    currentSong.addEventListener("timeupdate", () => {
      document.querySelector(".current").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}`;
      document.querySelector(".circle-2").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    currentSong.addEventListener("timeupdate", () => {
      document.querySelector(".total").innerHTML = `${secondsToMinutesSeconds(currentSong.duration)}`;
      document.querySelector(".circle-2").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
      let seekbar = e.target.getBoundingClientRect();
      let clickPosition = (e.clientX - seekbar.left) / seekbar.width;
      currentSong.currentTime = clickPosition * currentSong.duration;
    });

    document.querySelector(".seekbar-2").addEventListener("click", (e) => {
      let seekbar = e.target.getBoundingClientRect();
      let clickPosition = (e.clientX - seekbar.left) / seekbar.width;
      currentSong.currentTime = clickPosition * currentSong.duration;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
      document.querySelector(".left").style.left = 0;
    });

    document.querySelector(".close").addEventListener("click", () => {
      document.querySelector(".left").style.left = "-120%";
    });

    document.querySelector(".songinfo").addEventListener("click", () => {
      document.querySelector(".song-tab").style.bottom = 0;
    });

    document.querySelector(".dropdown").addEventListener("click", () => {
      document.querySelector(".song-tab").style.bottom = "-120%";
    });

    previousButton.addEventListener("click", () => {
      currentSong.pause();
      let index = songs.indexOf(decodeURI(currentSong.src.split("/").slice(-1)[0]));
      if (index > 0) {
        playMusic(songs[index - 1]);
      } else {
        playMusic(songs[songs.length - 1]);
      }
    });

    nextButton.addEventListener("click", () => {
      currentSong.pause();
      let index = songs.indexOf(decodeURI(currentSong.src.split("/").slice(-1)[0]));
      if (index < songs.length - 1) {
        playMusic(songs[index + 1]);
      } else {
        playMusic(songs[0]);
      }
    });

    document.querySelector(".range input").addEventListener("input", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
      if (currentSong.volume > 0) {
        document.querySelector(".volume img").src = "Images/volume.svg";
      } else {
        document.querySelector(".volume img").src = "Images/mute.svg";
      }
    });

    document.querySelector(".volume img").addEventListener("click", () => {
      if (currentSong.volume > 0) {
        currentSong.volume = 0;
        document.querySelector(".range input").value = 0;
        document.querySelector(".volume img").src = "Images/mute.svg";
      } else {
        currentSong.volume = 0.5;
        document.querySelector(".range input").value = 50;
        document.querySelector(".volume img").src = "Images/volume.svg";
      }
    });

  } catch (error) {
    console.error("Error initializing application:", error);
  }
}

main();
