import React, { useState } from "react";

type GraphCarouselProps = {
    children: React.ReactNode;
}

const GraphCarousel = ({ children }: GraphCarouselProps) => {
    const [currentSlide, setCurrentSlide] = useState<number>(0);

    const items = React.Children.toArray(children);

    const nextButtonHandler = () => setCurrentSlide((prev) => (prev + 1) % items.length)
    const backButtonHandler = () => setCurrentSlide((prev) => (prev - 1 + items.length) % items.length)

    return (
        <div className="relative">
            {items[currentSlide]}

            <button
                onClick={backButtonHandler}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full px-3 py-1"
            >
                ◀
            </button>
            <button
                onClick={nextButtonHandler}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full px-3 py-1"
            >
                ▶
            </button>
        </div>
    );
}

export default GraphCarousel;