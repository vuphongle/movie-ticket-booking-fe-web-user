import { useState } from 'react';
import styled from 'styled-components';
import {
  useGetMostViewBlogsQuery,
  useGetLatestBlogsQuery,
} from '@app/services/blog.api';
import type { BlogDto } from '@app/services/blog.api';
import { useGetAllReviewsQuery } from '@app/services/review.api';
import type { ReviewDto } from '@app/services/review.api';
import { theme } from '@theme/Theme';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

enum CinemaCornerTab {
  BLOG = 'BLOG',
  REVIEW = 'REVIEW',
  CAST = 'CAST',
}

export default function CinemaCornerComponent() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<CinemaCornerTab>(
    CinemaCornerTab.BLOG
  );

  // Blog queries
  const { data: mostViewPage, isLoading: loadingMost } =
    useGetMostViewBlogsQuery({ limit: 4 });
  const { data: latestPage, isLoading: loadingLatest } = useGetLatestBlogsQuery(
    { limit: 4 }
  );

  // Review query
  const { data: reviewPage, isLoading: loadingReviews } = useGetAllReviewsQuery(
    { page: 1, limit: 4 }
  );

  const mostViewBlogs: BlogDto[] = mostViewPage ?? [];
  const latestBlogs: BlogDto[] = latestPage?.content ?? [];
  const reviews: ReviewDto[] = reviewPage?.content ?? [];

  if (loadingMost || loadingLatest || loadingReviews)
    return <div>{t('CINEMACORNER_LOADING')}</div>;

  return (
    <Container>
      <Heading>{t('CINEMACORNER_CORNER')}</Heading>
      <Tabs>
        <div
          style={{
            color: activeTab === CinemaCornerTab.BLOG ? '#FFFFFF' : '#B0B0B0',
          }}
          onClick={() => setActiveTab(CinemaCornerTab.BLOG)}
        >
          {t('CINEMACORNER_TAB_BLOG')}
        </div>
        <div
          style={{
            color: activeTab === CinemaCornerTab.REVIEW ? '#FFFFFF' : '#B0B0B0',
          }}
          onClick={() => setActiveTab(CinemaCornerTab.REVIEW)}
        >
          {t('CINEMACORNER_TAB_REVIEW')}
        </div>
        <div
          style={{
            color: activeTab === CinemaCornerTab.CAST ? '#FFFFFF' : '#B0B0B0',
          }}
          onClick={() => setActiveTab(CinemaCornerTab.CAST)}
        >
          {t('CINEMACORNER_TAB_CAST')}
        </div>
      </Tabs>

      {/* Content */}
      <Content>
        {/* Tab Blog */}
        {activeTab === CinemaCornerTab.BLOG && latestBlogs.length > 0 && (
          <>
            <MainReview>
              <ReviewCard
                onClick={() =>
                  navigate(`/blogs/${latestBlogs[0].id}/${latestBlogs[0].slug}`)
                }
              >
                <img
                  src={latestBlogs[0].thumbnail}
                  alt={latestBlogs[0].title}
                />
                <div className='title'>{latestBlogs[0].title}</div>
              </ReviewCard>
            </MainReview>
            <SideReviews>
              {latestBlogs.slice(1).map(blog => (
                <ReviewCard
                  key={blog.id}
                  onClick={() => navigate(`/blogs/${blog.id}/${blog.slug}`)}
                >
                  <img src={blog.thumbnail} alt={blog.title} />
                  <div className='title'>{blog.title}</div>
                </ReviewCard>
              ))}
            </SideReviews>
          </>
        )}

        {/* Tab Review */}
        {activeTab === CinemaCornerTab.REVIEW && reviews.length > 0 && (
          <ReviewList>
            {reviews.map(r => (
              <ReviewItem key={r.id}>
                {r.movie?.poster && (
                  <img
                    src={r.movie.poster}
                    alt={r.movie.name}
                    className='poster'
                  />
                )}
                <p className='content'>“{r.comment}”</p>
                <span className='meta'>
                  — {r.user?.name ?? t('REVIEWS_ANONYMOUS')} (
                  {r.movie?.name ?? t('CINEMACORNER_MOVIE')}), ⭐ {r.rating}/10
                  — {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </ReviewItem>
            ))}
          </ReviewList>
        )}

        {/* Tab Cast */}
        {activeTab === CinemaCornerTab.CAST && mostViewBlogs.length > 0 && (
          <>
            <MainReview>
              <ReviewCard>
                <img
                  src={mostViewBlogs[0].thumbnail}
                  alt={mostViewBlogs[0].title}
                />
                <div className='title'>{mostViewBlogs[0].title}</div>
              </ReviewCard>
            </MainReview>
            <SideReviews>
              {mostViewBlogs.slice(1).map(blog => (
                <ReviewCard key={blog.id}>
                  <img src={blog.thumbnail} alt={blog.title} />
                  <div className='title'>{blog.title}</div>
                </ReviewCard>
              ))}
            </SideReviews>
          </>
        )}
      </Content>

      {activeTab === CinemaCornerTab.REVIEW ? (
        <ButtonMore onClick={() => navigate('/reviews')}>
          {t('CINEMACORNER_ALL_REVIEWS')}
        </ButtonMore>
      ) : (
        <ButtonMore onClick={() => navigate('/blogs')}>
          {t('CINEMACORNER_SEE_MORE')}
        </ButtonMore>
      )}
    </Container>
  );
}

/* ------------------ styles ------------------ */
const Container = styled.div`
  margin: ${theme.spacing.xl} 0;
  text-align: center;
`;

const Heading = styled.h2`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 20px;
  color: ${theme.colors.headingLight};
`;

const Tabs = styled.div`
  display: flex;
  gap: ${theme.spacing.xl};
  font-weight: 600;
  cursor: pointer;
  justify-content: center;
  color: ${theme.colors.textLight};
`;

const Content = styled.div`
  display: flex;
  margin-top: ${theme.spacing.md};
  gap: ${theme.spacing.md};
`;

const MainReview = styled.div`
  flex: 2;
`;

const SideReviews = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const ReviewCard = styled.div`
  display: flex;
  flex-direction: column;
  cursor: pointer;
  text-align: left;
  overflow: hidden;
  color: ${theme.colors.textLight};

  img {
    width: 100%;
    height: auto;
    object-fit: cover;
    border-radius: ${theme.borderRadius.medium};
    transition:
      transform 0.3s ease,
      filter 0.3s ease;
  }

  .title {
    margin-top: ${theme.spacing.sm};
    font-size: 15px;
    font-weight: 500;
    transition: color 0.3s ease;
  }

  &:hover img {
    transform: scale(1.03);
    filter: brightness(0.5);
  }

  &:hover .title {
    color: #c3dcff;
  }
`;

const ReviewList = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  text-align: left;
`;

const ReviewItem = styled.div`
  padding: ${theme.spacing.md};
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  color: ${theme.colors.textLight};

  .poster {
    width: 100%;
    height: 140px;
    object-fit: cover;
    border-radius: 4px;
    margin-bottom: 8px;
  }

  .content {
    font-style: italic;
    margin-bottom: 6px;
  }

  .meta {
    font-size: 13px;
    color: ${theme.colors.gray};
  }
`;

const ButtonMore = styled.button`
  margin-top: 12px;
  padding: 10px 48px;
  border: 1px solid ${theme.colors.white};
  border-radius: 6px;
  background-color: transparent;
  color: ${theme.colors.textLight};
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: ${theme.colors.primaryHoverGradient};
    color: ${theme.colors.white};
    font-weight: 700;
  }
`;

export {
  Container,
  Heading,
  Tabs,
  Content,
  MainReview,
  SideReviews,
  ReviewCard,
  ReviewList,
  ReviewItem,
  ButtonMore,
};
