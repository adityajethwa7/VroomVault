import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ImageGallery = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <img
        src={typeof images[currentIndex] === 'string' ? images[currentIndex] : URL.createObjectURL(images[currentIndex])}
        alt={`Car image ${currentIndex + 1}`}
        className="w-full h-64 object-cover rounded-lg"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
    </div>
  );
};

export default ImageGallery;

