import AliceCarousel from "react-alice-carousel";
import "react-alice-carousel/lib/alice-carousel.css";
import carouselData from "../utility/carouselData";

function Banner() {
  const items = carouselData.map((item, index) => (
    <div
      key={index}
      className="relative flex h-[44vh] sm:h-[54vh] md:h-[66vh] max-h-[600px] w-full items-end bg-cover bg-center"
      style={{ backgroundImage: `url(${item.image})` }}
    >
      {/* Cinematic Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 via-transparent to-transparent" />

      {/* Hero Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-8 sm:px-10 sm:pb-12 md:pb-16">
        <div className="inline-flex items-center gap-2 rounded-full bg-red-600/90 px-3.5 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-md backdrop-blur-sm">
          <i className="fa-solid fa-fire text-xs" />
          <span>Spotlight</span>
        </div>

        <h1 className="mt-3 text-3xl font-black tracking-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl">
          {item.title}
        </h1>

        <p className="mt-2.5 max-w-xl text-sm sm:text-base font-medium text-gray-200 drop-shadow">
          Stream, discover, and build your ultimate personal entertainment watchlist.
        </p>
      </div>
    </div>
  ));

  return (
    <div className="relative w-full overflow-hidden bg-gray-950 shadow-inner">
      <AliceCarousel
        autoPlay
        infinite
        mouseTracking
        autoPlayInterval={3500}
        animationDuration={1000}
        disableButtonsControls
        items={items}
      />
    </div>
  );
}

export default Banner;
