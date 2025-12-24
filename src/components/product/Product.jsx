import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import { addItem } from "../../redux/cart/cartSlice";
import { openCart } from "../../redux/ui/cartDrawer";

const API_BASE_URL_MEDIA = "http://localhost:8000";

export default function Product({ product, loading }) {
  const dispatch = useDispatch();
  const view = useSelector((state) => state.view.view);

  if (loading) {
    return (
      <div className="border rounded-md p-3 animate-pulse">
        <div className="h-64 bg-gray-200 rounded mb-3" />
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    );
  }

  const mainMedia = product.media?.find((m) => m.type === "image");
  const imageSrc = mainMedia
    ? mainMedia.src
    : "https://via.placeholder.com/300";

  const originalPrice = product.Price;
  const promotion = product.promotion || 0;
  const discountedPrice = (
    originalPrice -
    (originalPrice * promotion) / 100
  ).toFixed(2);

  const sliderSettings = {
    dots: true,
    arrows: false,
    infinite: true,
    autoplay: true,
    fade: true,
    speed: 800,
    autoplaySpeed: 3500,
    appendDots: (dots) => (
      <div className="pb-2">
        <ul className="flex justify-center gap-1">{dots}</ul>
      </div>
    ),
    customPaging: (i) => {
      let bg = "#ccc";
      if (i > 0 && product.colors?.[i - 1]) {
        bg = product.colors[i - 1].value;
      }
      return (
        <div
          className="w-6 h-1 rounded-full opacity-40"
          style={{ backgroundColor: bg }}
        />
      );
    },
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-TN", {
      style: "currency",
      currency: "TND",
      minimumFractionDigits: 3,
    }).format(price);
  };
  return (
    <div className="group relative">
      <Link
        to={`/product/${product.slug}`}
        className="flex flex-col overflow-hidden bg-white shadow-md transition"
      >
        {/* IMAGE / SLIDER */}
        <div className="overflow-hidden">
          <Slider {...sliderSettings}>
            {/* Main image */}
            <div>
              <img
                src={imageSrc}
                alt={product.Title}
                className="w-full h-72 object-cover group-hover:scale-105 transition-transform"
              />
            </div>

            {/* Color images */}
            {product.colors?.map((color, i) => (
              <div key={i}>
                <img
                  src={`${API_BASE_URL_MEDIA}${color.src}`}
                  alt={color.name}
                  className="w-full h-72 object-cover"
                />
              </div>
            ))}
          </Slider>
          {/* Promotion badge */}
          {promotion > 0 && (
            <span className="absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded bg-gradient-to-r from-[#d4af37] to-[#f5d76e] text-[#0d1b2a]">
              -{promotion}%
            </span>
          )}
        </div>

        {/* CONTENT */}
        <div className=" bg-white px-1">
          {/* TITLE + COLORS */}
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm md:text-base truncate text-[#0d1b2a] group-hover:text-[#d4af37] transition">
              {product.Title}
            </h3>

            {/* Color variations */}
            <div className="flex items-center gap-1">
              {product.colors?.slice(0, 4).map((color, i) => (
                <span
                  key={i}
                  title={color.name}
                  className="w-3.5 h-3.5 rounded-full border border-black/10 hover:scale-110 hover:ring-2 hover:ring-[#d4af37] transition"
                  style={{ backgroundColor: color.value }}
                />
              ))}
              {product.colors?.length > 4 && (
                <span className="text-[10px] text-gray-400">
                  +{product.colors.length - 4}
                </span>
              )}
            </div>
          </div>

          {/* PRICE */}
          <div className="flex items-center gap-2">
            {promotion > 0 ? (
              <>
                <span className="line-through text-gray-400 text-sm">
                  {originalPrice}
                </span>
                <span className="text-xs  text-[#d4af37]">
                  {discountedPrice}
                </span>
              </>
            ) : (
              <span className="text-xs  text-[#0d1b2a]">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
