import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import { ChevronDoubleRightIcon } from "@heroicons/react/24/outline";
import { TbCameraPlus } from "react-icons/tb";
import { useSelector } from "react-redux";

import CustomModal from "../ui/Modal";
import { Input } from "../ui";
import { createBanner, getBanners, removeBanner } from "../../functions/banner";

export default function Banner() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [slides, setSlides] = useState([]);
  const [newSlide, setNewSlide] = useState({
    title: "",
    img: "",
    button: "",
    link: "",
  });

  const user = useSelector((state) => state.user.userInfo);

const API_BASE_URL_MEDIA = "https://skands-server.onrender.com";

  const settings = {
    dots: true,
    infinite: true,
    autoplay: !loading,
    autoplaySpeed: 2000,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    cssEase: "ease-out",
  };

  const normalizeBannerSrc = (input) => {
    if (!input) return input;
    if (Array.isArray(input)) {
      return input.map((item) => normalizeBannerSrc(item));
    }
    return {
      ...input,
      img: input.img?.startsWith("http")
        ? input.img
        : API_BASE_URL_MEDIA + input.img,
    };
  };

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        setLoading(true);
        const { data } = await getBanners();

        const normalizedSlides = normalizeBannerSrc(data).map((banner) => ({
          title: banner.title,
          img: banner.img,
          button: "Learn More",
          link: banner.link || "/",
        }));

        setSlides(normalizedSlides);
      } catch (err) {
        console.error("❌ Error fetching banners:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("title", newSlide.title);
      formData.append("link", newSlide.link);
      if (newSlide.file) formData.append("file", newSlide.file);

      const { data } = await createBanner(formData);

      setSlides((prev) => [
        ...prev,
        {
          title: data.title,
          img: API_BASE_URL_MEDIA + data.img,
          button: newSlide.button,
          link: data.link,
        },
      ]);

      setNewSlide({
        title: "",
        img: "",
        button: "",
        link: "",
        preview: "",
        file: null,
      });
    } catch (err) {
      console.error("❌ Error creating banner:", err);
    }
  };

  /* 🦴 Skeleton Slide */
  const SkeletonSlide = () => (
    <div className="relative w-full overflow-hidden">
      <div className="relative w-full h-[550px] overflow-hidden">
        <div className="w-full h-full bg-gray-200 animate-pulse" />
      </div>

      <div className="absolute bottom-0 left-0 w-full flex flex-col items-center justify-center p-4 gap-2">
        <div className="w-48 h-5 bg-gray-300 rounded animate-pulse" />
        <div className="w-32 h-8 bg-gray-300 rounded animate-pulse mt-2" />
      </div>
    </div>
  );

  return (
    <div className="h-full mx-auto md:mx-10 bg-transparent">
      <div className="relative w-full">
        <Slider {...settings}>
          {loading
            ? Array.from({ length: 2 }).map((_, idx) => (
                <SkeletonSlide key={idx} />
              ))
            : slides.map((slide, index) => (
                <div key={index} className="relative w-full overflow-hidden">
                  {/* IMAGE */}
                  <div className="relative w-full h-[550px] overflow-hidden">
                    <img
                      src={slide.img}
                      alt={slide.title}
                      className="w-full h-full object-cover cinematic-zoom"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                  </div>

                  {/* CONTENT */}
                  <div className="absolute bottom-0 left-0 w-full flex flex-col items-center text-center p-4 gap-2">
                    <h2 className="text-md md:text-2xl font-serif text-white tracking-wide drop-shadow-lg">
                      {slide.title}
                    </h2>

                    <div className="flex flex-col items-center">
                      <Link to={slide.link}>
                        <button
                          className="
                            mt-1 flex items-center gap-2 px-4 py-2
                            bg-white/20 backdrop-blur-xl
                            border border-white/30 text-sm md:text-base
                            text-white tracking-wide
                            hover:bg-white/30 transition
                          "
                        >
                          DISCOVER ALL
                          {/* <ChevronDoubleRightIcon className="w-4 h-4" /> */}
                        </button>
                      </Link>

                      <div className="animate-scroll-push">
                        <span className="text-white/70 text-xs tracking-widest uppercase">
                          Scroll to see more ↓
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
        </Slider>

        {/* ADMIN BUTTON */}
        {user && (
          <button
            onClick={() => setOpen(true)}
            className="absolute bottom-4 right-4 z-10 flex gap-2
              bg-white/30 backdrop-blur-md text-white
              px-4 py-2 border border-white hover:bg-white/50 transition"
          >
            <TbCameraPlus className="h-6 w-6" />
            <span className="hidden sm:inline">Manage Pictures</span>
          </button>
        )}
      </div>

      {/* MODAL */}
      <CustomModal
        open={open}
        setOpen={setOpen}
        title="Importer une photo"
        message={
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border p-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setNewSlide({
                        ...newSlide,
                        file,
                        preview: URL.createObjectURL(file),
                      });
                    }
                  }}
                />
                <Input
                  placeholder="Title"
                  value={newSlide.title}
                  onChange={(e) =>
                    setNewSlide({ ...newSlide, title: e.target.value })
                  }
                />
                <Input
                  placeholder="Link"
                  value={newSlide.link}
                  onChange={(e) =>
                    setNewSlide({ ...newSlide, link: e.target.value })
                  }
                />
                <button
                  onClick={handleSubmit}
                  className="w-full bg-green-600 text-white py-2 mt-2"
                >
                  Add Slide
                </button>
              </div>
            </div>
          </div>
        }
      />
    </div>
  );
}
