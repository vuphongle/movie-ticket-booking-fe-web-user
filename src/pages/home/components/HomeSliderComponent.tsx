import styled from 'styled-components';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
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
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={true}
        pagination={{ clickable: true }}
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
  max-height: 500px;
  position: relative;

  .swiper-pagination-bullet {
    background: rgba(255, 255, 255, 0.7);
    opacity: 1;
  }

  .swiper-pagination-bullet-active {
    background: #ff6b00;
  }

  .swiper-button-prev,
  .swiper-button-next {
    color: white;
    width: 44px;
    height: 44px;
  }
`;

const SlideContainer = styled.div`
  position: relative;
  width: 100%;
  height: 500px;
`;

const SlideImage = styled.img`
  width: 100%;
  height: 500px;
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

