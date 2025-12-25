import React, { useRef } from "react";
import Banner from "../components/home/Banner";
import CategoryGrid from "../components/home/CategoryGrid";
import HomeVideoSection from "../components/home/HomeVideoSection";
import NewArrivals from "../components/home/NewArrivals";
import Story from "../components/home/Story";

export default function Home() {
  const newArrivalsRef = useRef(null);

  return (
    <div className="bg-white relative">
      {/* Top Banner */}
      <Banner />
      <CategoryGrid />

      {/* Sticky Video Section */}
      <div className="relative z-0">
        <div className="sticky top-0 z-10">
         <HomeVideoSection
  title="SKANDS"
  subtitle="A new vision of elegance"
  triggerRef={newArrivalsRef}
/>
        </div>

        {/* Next sections scroll over the sticky video */}
        <div ref={newArrivalsRef} className="relative z-20">
          <NewArrivals />
        </div>

        {/* Story always above video */}
        <div className="relative z-20">
          <Story />
        </div>
      </div>
    </div>
  );
}
