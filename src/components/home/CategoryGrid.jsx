import React from "react";
import { Link } from "react-router-dom";
import { useInView } from "react-intersection-observer";

import coat from "../../assets/coat.PNG";
import dress from "../../assets/dress.PNG";
import shoes from "../../assets/shoes.PNG";
import sac from "../../assets/sac.PNG";

const categories = [
  { title: "Women Coats", image: coat, link: "/category/coats" },
  { title: "Women Dresses", image: dress, link: "/category/dresses" },
  { title: "Women Shoes", image: shoes, link: "/category/shoes" },
  { title: "Women Bags", image: sac, link: "/category/bags" },
];

export default function CategoryGrid() {
  return (
    <section className="mx-auto px-2 md:px-10 py-2">
      {/* SECTION TITLE */}
      <h2
        className="
         text-2xl md:text-4xl font-semiBold tracking-tight text-gray-900 my-4 text-center
        "
      >
        Explore a Selection of the Maison's Creations
      </h2>

      {/* GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {categories.map((cat, index) => (
          <CategoryCard key={index} cat={cat} />
        ))}
      </div>
    </section>
  );
}

/* ========================= */
/* CATEGORY CARD */
/* ========================= */

function CategoryCard({ cat }) {
  const { ref, inView } = useInView({
    threshold: 0.3, // Trigger when 30% visible
    triggerOnce: true,
  });

  return (
    <Link
      ref={ref}
      to={cat.link}
      className="flex flex-col items-center"
    >
      {/* IMAGE */}
      <div className="relative w-full h-[200px] overflow-hidden bg-neutral-100">
        <img
          src={cat.image}
          alt={cat.title}
          className={`
            w-full h-full
            transform
            transition-transform duration-[1000ms] ease-out
            ${inView ? "scale-100" : "scale-[1.2]"}
          `}
        />
      </div>

      {/* TEXT (APPEARS AFTER IMAGE ANIMATION) */}
      <h3
        className={`
          mt-5 text-sm md:text-base
          tracking-widest uppercase text-center
          transform transition-all duration-700 ease-out
          delay-[900ms]
          ${inView
            ? "translate-y-0 opacity-100"
            : "translate-y-6 opacity-0"}
        `}
      >
        {cat.title}
      </h3>
    </Link>
  );
}
