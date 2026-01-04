import React, { useEffect, useRef, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useSelector } from "react-redux";
import {
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  XMarkIcon,
  PlayIcon,
  PauseIcon,
} from "@heroicons/react/24/solid";
import { getStorySlides } from "../../functions/storySlide";
import { NextArrow, PrevArrow } from "../ui";

const API_BASE_URL_MEDIA = "https://skands-server.onrender.com";

export default function Story() {
  const { userInfo } = useSelector((s) => s.user);
  const [slides, setSlides] = useState([]);
  const [fullscreen, setFullscreen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const videoRefs = useRef([]);
  const observerRef = useRef(null);

  const [activeVideo, setActiveVideo] = useState(null);
  const [muted, setMuted] = useState(true);

  /* ================= FETCH ================= */
  useEffect(() => {
    (async () => {
      const res = await getStorySlides();
      const data = res.data.map((s) => ({
        ...s,
        videoUrl: `${API_BASE_URL_MEDIA}/${s.videoUrl.replace(/\\/g, "/")}`,
      }));
      setSlides(data);
    })();
  }, []);

  /* ================= RESPONSIVE ================= */
  useEffect(() => {
    const resize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  /* ================= AUTOPLAY (DESKTOP + MOBILE IN VIEW) ================= */
  useEffect(() => {
    if (fullscreen) return;

    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.dataset.index);
          const video = videoRefs.current[index];
          if (!video) return;

          if (entry.isIntersecting) {
            setActiveVideo(index);
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.6 }
    );

    videoRefs.current.forEach((v) => v && observerRef.current.observe(v));

    return () => observerRef.current?.disconnect();
  }, [slides, fullscreen]);

  /* ================= SLIDER SETTINGS ================= */
  const desktopSettings = {
    dots: true,
    infinite: false,
    slidesToShow: 3.5,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  const mobileSettings = {
    dots: false,
    infinite: false,
    slidesToShow: 1.5,
    slidesToScroll: 1,
    arrows: false,
    swipeToSlide: true,
  };

  return (
    <div className="bg-white py-10">
      <h2 className="text-xl mb-4 text-center flex justify-center gap-2">
        <span>🎬</span> Artisanat Bargaoui Services
      </h2>

      <Slider {...(isMobile ? mobileSettings : desktopSettings)}>
        {slides.map((s, i) => (
          <div
            key={s._id}
            className="px-1 relative cursor-pointer"
            onClick={() => {
              setStartIndex(i);
              setFullscreen(true);
            }}
          >
            <video
              ref={(el) => (videoRefs.current[i] = el)}
              data-index={i}
              src={s.videoUrl}
              muted={muted}
              playsInline
              preload="metadata"
              loop
              className="h-[350px] w-full object-cover rounded-md"
            />

            {/* RIGHT CONTROLS */}
            <div className="absolute right-3 top-3 flex flex-col gap-2 z-20">
              {/* PLAY / PAUSE */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const video = videoRefs.current[i];
                  if (!video) return;

                  if (video.paused) {
                    setActiveVideo(i);
                    video.play();
                  } else {
                    video.pause();
                  }
                }}
                className="bg-black/50 p-2 rounded-full text-white"
              >
                {activeVideo === i && !videoRefs.current[i]?.paused ? (
                  <PauseIcon className="w-4 h-4" />
                ) : (
                  <PlayIcon className="w-4 h-4" />
                )}
              </button>

              {/* MUTE */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMuted((m) => !m);
                }}
                className="bg-black/50 p-2 rounded-full text-white"
              >
                {muted ? (
                  <SpeakerXMarkIcon className="w-4 h-4" />
                ) : (
                  <SpeakerWaveIcon className="w-4 h-4" />
                )}
              </button>
            </div>

            <p className="text-center mt-2">{s.title}</p>
          </div>
        ))}
      </Slider>

      {fullscreen && (
        <FullscreenReels
          slides={slides}
          startIndex={startIndex}
          onClose={() => setFullscreen(false)}
        />
      )}
    </div>
  );
}

/* ================= FULLSCREEN (UNCHANGED LOGIC, CLEAN) ================= */
function FullscreenReels({ slides, startIndex, onClose }) {
  const containerRef = useRef(null);
  const videoRefs = useRef([]);
  const [active, setActive] = useState(startIndex);
  const [unmutedId, setUnmutedId] = useState(null);

  useEffect(() => {
    containerRef.current?.children[startIndex]?.scrollIntoView();
  }, [startIndex]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setActive(Number(e.target.dataset.index));
          }
        });
      },
      { threshold: 0.7 }
    );

    [...containerRef.current.children].forEach((n) =>
      observer.observe(n)
    );

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i === active) {
        video.play().catch(() => {});
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [active]);

  return (
    <div className="fixed inset-0 bg-black z-50">
      <button
        onClick={onClose}
        className="absolute top-20 right-4 text-white z-50"
      >
        <XMarkIcon className="w-8 h-8" />
      </button>

      <div
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory"
      >
        {slides.map((s, i) => (
          <div
            key={s._id}
            data-index={i}
            className="h-screen snap-start relative"
          >
            <video
              ref={(el) => (videoRefs.current[i] = el)}
              src={s.videoUrl}
              muted={unmutedId !== s._id}
              playsInline
              loop
              className="absolute inset-0 w-full h-full object-cover"
            />

            <button
              onClick={() =>
                setUnmutedId(unmutedId === s._id ? null : s._id)
              }
              className="absolute right-4 bottom-24 bg-black/50 p-3 rounded-full text-white"
            >
              {unmutedId === s._id ? (
                <SpeakerWaveIcon className="w-6" />
              ) : (
                <SpeakerXMarkIcon className="w-6" />
              )}
            </button>

            <div className="absolute bottom-10 left-4 text-white z-20">
              <h2 className="text-xl font-bold">{s.title}</h2>
              <p className="opacity-80">{s.description}</p>
            </div>

            <div className="absolute inset-0 bg-black/30" />
          </div>
        ))}
      </div>
    </div>
  );
}
