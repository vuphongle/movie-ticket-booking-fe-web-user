import styled from 'styled-components';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

interface SliderItem {
  id: number;
  image: string;
  alt?: string;
}

interface Props {
  slides: SliderItem[];
}

export default function HomeSliderComponent({ slides }: Props) {
  return (
    <SliderWrapper>
      <Swiper
        modules={[Autoplay, Navigation]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        speed={1000}
        loop={true}
        navigation
        slidesPerView={1}
      >
        {slides.map(slide => (
          <SwiperSlide key={slide.id}>
            <SlideContainer>
              <SlideImage src={slide.image} alt={slide.alt ?? 'slide'} />
              <GradientOverlay />
            </SlideContainer>
          </SwiperSlide>
        ))}
      </Swiper>
    </SliderWrapper>
  );
}

/* Styled */
const SliderWrapper = styled.div`
  width: 100%;
  position: relative;

  .swiper-pagination {
    display: none !important;
  }

  /* Nút điều hướng */
  .swiper-button-prev,
  .swiper-button-next {
    color: white;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.4);
    transition: all 0.3s ease;
  }

  .swiper-button-prev:hover,
  .swiper-button-next:hover {
    background: rgba(0, 0, 0, 0.7);
    transform: scale(1.1);
  }
`;

const SlideContainer = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 21 / 9;
  overflow: hidden;

  @media (max-width: 1200px) {
    aspect-ratio: 16 / 9;
  }

  @media (max-width: 768px) {
    aspect-ratio: 4 / 3;
  }
`;

const SlideImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const GradientOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(128, 0, 255, 0.2) 0%,
    rgba(0, 255, 0, 0.2) 100%
  );
`;
