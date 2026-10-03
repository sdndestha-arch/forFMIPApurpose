window.addEventListener("load", () => {
        document.body.classList.remove("container");

        const card = document.querySelector(".music-card");
        const playButton = document.querySelector("#playButton");
        const music = document.querySelector("#music");
        const progress = document.querySelector("#progress");
        const currentTime = document.querySelector("#currentTime");
        const duration = document.querySelector("#duration");
        const musicStatus = document.querySelector("#musicStatus");
        const lyricsToggle = document.querySelector("#lyricsToggle");
        const lyricsContainer = document.querySelector("#lyrics");
        const lyrics = [...document.querySelectorAll(".lyrics p")];
        const startTime = 124.78;
        const lyricSpeed = 1;
        const firstLyricTime = Number(lyrics[0]?.dataset.time);
        let activeLyric;

        const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
        const updateDuration = () => {
                if (Number.isFinite(music.duration)) {
                        progress.max = music.duration;
                        duration.textContent = formatTime(music.duration);
                }
        };
        const updateLyrics = () => {
                const lyricTime = firstLyricTime + (music.currentTime - firstLyricTime) * lyricSpeed;
                if (lyricTime < firstLyricTime) {
                        lyrics.forEach((lyric) => lyric.classList.remove("active"));
                        activeLyric = undefined;
                        return;
                }
                const nextLyric = lyrics.reduce((active, lyric) => {
                        const cueTime = Number(lyric.dataset.time) + Number(lyric.dataset.lag || 0) * lyricSpeed;
                        return cueTime <= lyricTime ? lyric : active;
                }, lyrics[0]);
                lyrics.forEach((lyric) => lyric.classList.toggle("active", lyric === nextLyric));
                if (nextLyric !== activeLyric) {
                        activeLyric = nextLyric;
                        const containerRect = lyricsContainer.getBoundingClientRect();
                        const lyricRect = activeLyric.getBoundingClientRect();
                        const lyricTop = lyricsContainer.scrollTop + lyricRect.top - containerRect.top;
                        lyricsContainer.scrollTo({
                                top: Math.max(0, Math.min(
                                        lyricTop - lyricsContainer.clientHeight * 0.28,
                                        lyricsContainer.scrollHeight - lyricsContainer.clientHeight
                                )),
                                behavior: "smooth"
                        });
                }
        };
        const updateState = () => {
                const isPlaying = !music.paused;
                card.classList.toggle("is-playing", isPlaying);
                playButton.textContent = isPlaying ? "Pause" : "Play";
                playButton.setAttribute("aria-label", isPlaying ? "Jeda musik" : "Putar musik");
        };

        music.volume = 0.35;
        music.muted = false;

        fetch("wave to earth - ride.mp3")
                .then((response) => {
                        if (!response.ok) throw new Error("Audio tidak ditemukan");
                        return response.blob();
                })
                .then((audioBlob) => {
                        music.src = URL.createObjectURL(audioBlob);
                        music.load();
                })
                .catch(() => { musicStatus.textContent = "File audio tidak dapat dimuat."; });

        playButton.addEventListener("click", () => {
                if (music.paused) {
                        seekToStart();
                        music.play().then(() => { musicStatus.textContent = "Audio aktif."; }).catch(() => { musicStatus.textContent = "Browser memblokir autoplay. Klik Play lagi."; });
                } else {
                        music.pause();
                }
        });
        const seekToStart = () => {
                if (music.readyState >= 2 && music.duration > startTime) {
                        music.currentTime = startTime;
                        progress.value = startTime;
                        currentTime.textContent = formatTime(startTime);
                }
        };
        music.addEventListener("loadedmetadata", () => {
                seekToStart();
                updateDuration();
                music.play().then(() => {
                        seekToStart();
                        musicStatus.textContent = "Klik Suara untuk menyalakan audio.";
                        updateState();
                }).catch(() => { musicStatus.textContent = "Izinkan musik untuk mulai memutar audio."; });
        });
        music.addEventListener("durationchange", updateDuration);
        music.addEventListener("loadeddata", updateDuration);
        music.addEventListener("canplay", seekToStart, { once: true });
        music.addEventListener("canplaythrough", seekToStart, { once: true });
        music.addEventListener("play", () => {
                if (music.currentTime < startTime) seekToStart();
        });
        window.setInterval(() => {
                if (music.readyState >= 2 && music.duration > startTime && music.currentTime < startTime) seekToStart();
        }, 100);
        music.addEventListener("timeupdate", () => {
                if (music.currentTime < startTime && music.duration > startTime) seekToStart();
                updateDuration();
                progress.value = music.currentTime;
                currentTime.textContent = formatTime(music.currentTime);
                updateLyrics();
        });
        music.addEventListener("ended", () => {
                const transition = document.querySelector("#loveTransition");
                const heartField = transition.querySelector(".love-transition__hearts");

                for (let index = 0; index < 48; index += 1) {
                        const heart = document.createElement("span");
                        heart.className = "love-transition__heart";
                        heart.textContent = "\u2665";
                        heart.style.setProperty("--left", `${Math.random() * 100}%`);
                        heart.style.setProperty("--size", `${18 + Math.random() * 34}px`);
                        heart.style.setProperty("--duration", `${2.1 + Math.random() * 0.8}s`);
                        heart.style.setProperty("--delay", `${Math.random() * 0.25}s`);
                        heart.style.setProperty("--drift", `${-60 + Math.random() * 120}px`);
                        heartField.appendChild(heart);
                }

                document.body.classList.add("is-transitioning");
                transition.classList.add("is-active");
                transition.setAttribute("aria-hidden", "false");
                window.setTimeout(() => { window.location.href = "love.html"; }, 3200);
        });
        music.addEventListener("play", updateState);
        music.addEventListener("pause", updateState);
        progress.addEventListener("input", () => { music.currentTime = Number(progress.value); });
        lyricsToggle.addEventListener("click", () => {
                const isHidden = document.querySelector("#lyrics").classList.toggle("is-hidden");
                lyricsToggle.textContent = isHidden ? "Tampilkan lirik" : "Sembunyikan lirik";
                lyricsToggle.setAttribute("aria-expanded", String(!isHidden));
        });

        if (music.readyState >= 1) {
                seekToStart();
                updateDuration();
                music.play().then(seekToStart).catch(() => {
                        musicStatus.textContent = "Klik Mulai musik untuk memulai audio.";
                });
        }
});