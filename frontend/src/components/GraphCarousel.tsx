import React, { useState } from "react";

type GraphCarouselProps = {
    height: number;
    children: React.ReactNode;
}

const GraphCarousel = ({ height, children }: GraphCarouselProps) => {
    const [currentSlide, setCurrentSlide] = useState<number>(0);

    const items = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<{ height: number }>, { height });
        }
        return child;
    }) || [];

    const nextButtonHandler = () => setCurrentSlide((prev) => (prev + 1) % items.length)
    const backButtonHandler = () => setCurrentSlide((prev) => (prev - 1 + items.length) % items.length)

    return (
        <div className="relative">
            {items[currentSlide]}

            <button
                onClick={backButtonHandler}
                className="cursor-pointer transition absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full px-3 py-1"
            >
                ◀
            </button>
            <button
                onClick={nextButtonHandler}
                className="cursor-pointer transition absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full px-3 py-1"
            >
                ▶
            </button>

            <div className="flex justify-center mt-6 space-x-2">
                {items.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-2 w-7 transition cursor-pointer rounded-full transition ${index === currentSlide ? "bg-blue-300" : "bg-gray-400"}`}
                    />
                ))}
            </div>
        </div>
    );
}

export default GraphCarousel;