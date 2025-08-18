import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/theme/Theme';

interface Movie {
  id: number;
  title: string;
  posterUrl: string;
  rating?: string; 
  showtime?: string; 
}

const HomePage: React.FC = () => {
  const [hotMovies] = useState<Movie[]>([
    { id: 1, title: 'Phim Hot 1', posterUrl: '/images/hot1.jpg' },
    { id: 2, title: 'Phim Hot 2', posterUrl: '/images/hot2.jpg' },
    { id: 3, title: 'Phim Hot 3', posterUrl: '/images/hot3.jpg' },
  ]);


  return (
    <PageContainer>
      {/* Banner */}
      <BannerSection>
        <BannerTitle>Phim Hot Tháng 8</BannerTitle>
        <BannerCarousel>
          {hotMovies.map(movie => (
            <BannerItem key={movie.id}>
              <BannerImage src={movie.posterUrl} alt={movie.title} />
            </BannerItem>
          ))}
        </BannerCarousel>
      </BannerSection>

      {/* Phim đang chiếu */}
      <Section>
        <SectionTitle>Phim Đang Chiếu</SectionTitle>
      </Section>

      {/* Phim sắp chiếu */}
      <Section>
        <SectionTitle>Phim Sắp Chiếu</SectionTitle>
      </Section>

      {/* Lịch chiếu phim */}
      <ScheduleSection>
        <ScheduleTitle>Lịch chiếu phim</ScheduleTitle>
        <ScheduleTable>
        </ScheduleTable>
      </ScheduleSection>

      {/* Tin khuyến mãi */}
      <PromotionSection>
        <PromotionTitle>Tin khuyến mãi</PromotionTitle>
      </PromotionSection>

    {/* Góc điện ảnh */}
      <CinemaCornerSection>
        <CinemaCornerTitle>Góc điện ảnh</CinemaCornerTitle>
        <nav>
            <MenuItem>Thông tin phim</MenuItem>
            <MenuItem>Đánh giá phim</MenuItem>
            <MenuItem>Tin tức Đạo diên/diễn viên</MenuItem>
        </nav>
      </CinemaCornerSection>
    </PageContainer>
  );
};

// Styled components
const PageContainer = styled.div`
  background: ${theme.colors.background};
  color: ${theme.colors.textPrimary};
  padding: ${theme.spacing.md};
  font-family: 'Roboto', sans-serif;
  margin-bottom: ${theme.spacing.lg};
`;

const BannerSection = styled.section`
  margin-top: 10px;
  padding: 0;
`;

const BannerTitle = styled.h2`
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 6px;
`;

const BannerCarousel = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 12px;
  padding-bottom: 10px;
`;

const BannerItem = styled.div`
  flex: 0 0 auto;
  width: 320px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgb(0 0 0 / 0.15);
`;

const BannerImage = styled.img`
  width: 100%;
  height: 160px;
  object-fit: cover;
`;

const Section = styled.section`
  margin-top: 30px;
`;

const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
`;

const ScheduleSection = styled.section`
  margin-top: 40px;
`;

const ScheduleTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
`;

const ScheduleTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  thead tr {
    background-color: ${theme.colors.primary};
    color: white;
  }
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
  }
`;

const PromotionSection = styled.section`
  margin-top: 50px;
`;

const PromotionTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
`;

const CinemaCornerSection = styled.section`
  margin-top: 50px;
`;

const CinemaCornerTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
`;

const MenuItem = styled.div`
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  &:hover {
    background: ${theme.colors.backgroundHover};
  }
`;

export default HomePage;
