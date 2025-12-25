import React, { useEffect, useRef, useState } from "react";
import {
  PlayIcon,
  PauseIcon,
  SpeakerXMarkIcon,
  SpeakerWaveIcon,
} from "@heroicons/react/24/solid";
import rsVideo from "../../assets/rs.mp4";

const SOUND_KEY = "videoSoundUnlocked";

export default function HomeVideoSection({ title, subtitle, triggerRef }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  // Sync play/mute state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const syncPlay = () => setPlaying(!video.paused);
    const syncMute = () => setMuted(video.muted);

    video.addEventListener("play", syncPlay);
    video.addEventListener("pause", syncPlay);
    video.addEventListener("volumechange", syncMute);

    syncPlay();
    syncMute();

    return () => {
      video.removeEventListener("play", syncPlay);
      video.removeEventListener("pause", syncPlay);
      video.removeEventListener("volumechange", syncMute);
    };
  }, []);

  // Unlock audio on first user interaction
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const unlockAudio = () => {
      video.muted = false;
      setMuted(false);
      localStorage.setItem(SOUND_KEY, "true");
      video.play().catch(() => {});
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("scroll", unlockAudio);
    };

    if (!localStorage.getItem(SOUND_KEY)) {
      window.addEventListener("click", unlockAudio, { once: true });
      window.addEventListener("touchstart", unlockAudio, { once: true });
      window.addEventListener("scroll", unlockAudio, { once: true });
    }

    return () => {
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("scroll", unlockAudio);
    };
  }, []);

  // Play/pause based on video visibility & NewArrivals overlap
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !triggerRef?.current) return;

    const handlePlayPause = () => {
      const videoRect = video.getBoundingClientRect();
      const newArrivalsRect = triggerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      const videoVisible = videoRect.top + videoRect.height * 0.3 < windowHeight && videoRect.bottom - videoRect.height * 0.3 > 0;
      const newArrivalsVisible = newArrivalsRect.top < windowHeight * 0.7;

      if (videoVisible && !newArrivalsVisible) {
        const soundUnlocked = localStorage.getItem(SOUND_KEY);
        video.muted = !soundUnlocked;
        setMuted(video.muted);
        video.play().catch(() => {});
        setPlaying(true);
      } else {
        video.pause();
        video.muted = true;
        setMuted(true);
        setPlaying(false);
      }
    };

    window.addEventListener("scroll", handlePlayPause, { passive: true });
    window.addEventListener("resize", handlePlayPause);

    handlePlayPause(); // initial check

    return () => {
      window.removeEventListener("scroll", handlePlayPause);
      window.removeEventListener("resize", handlePlayPause);
    };
  }, [triggerRef]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.paused ? video.play() : video.pause();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    if (!video.muted) localStorage.setItem(SOUND_KEY, "true");
  };

  return (
    <section className="sticky top-0 w-full h-[550px] overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={rsVideo}
        loop
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      {/* Text + Controls */}
      <div className="absolute inset-0 z-20 flex items-end justify-between px-2 md:px-10 pb-2">
        <div className="max-w-xl text-white">
          <h2 className="text-md md:text-4xl font-serif tracking-wide">{title}</h2>
          <p className=" text-xs md:text-base text-white/70 uppercase tracking-widest">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 text-white hover:bg-white/30 transition"
          >
            {playing ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
            <span className="hidden md:inline">{playing ? "Pause" : "Play"}</span>
          </button>

          <button
            onClick={toggleMute}
            className="p-2.5 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 text-white hover:bg-white/30 transition"
          >
            {muted ? <SpeakerXMarkIcon className="w-4 h-4" /> : <SpeakerWaveIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </section>
  );
}
