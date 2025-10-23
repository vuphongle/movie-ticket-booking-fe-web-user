import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Helmet } from 'react-helmet';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useGetBlogDetailQuery } from '@app/services/blog.api';
import Error from '@components/errors/Error';
import Loading from '@components/loading/Loading';
import { formatDate_corner } from '@utils/functionUtils';
import ListBlogRecommend from './components/ListBlogRecommend';
import TableOfContents from './components/toc/TableOfContent';
import { theme } from '@theme/Theme';
import { useTranslation } from 'react-i18next';

const BlogDetail: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { blogId, blogSlug } = useParams<{
    blogId: string;
    blogSlug: string;
  }>();

  const {
    data: blog,
    isLoading: isLoadingBlogDetail,
    isError: isErrorBlogDetail,
    isFetching: isFetchingBlogDetail,
    refetch: refetchBlogDetail,
  } = useGetBlogDetailQuery({ id: Number(blogId), slug: blogSlug! });

  useEffect(() => {
    refetchBlogDetail();
  }, [location.pathname]);

  if (isLoadingBlogDetail || isFetchingBlogDetail) {
    return <Loading />;
  }

  if (isErrorBlogDetail) {
    return <Error />;
  }

  if (!blog) return null;

  return (
    <>
      <Helmet>
        <title>{blog?.title}</title>
      </Helmet>

      <Container>
        <Breadcrumb>
          <BreadcrumbItem clickable>
            <StyledLink to='/'>{t('HOME')}</StyledLink>
          </BreadcrumbItem>
          <Divider>&gt;</Divider>
          <BreadcrumbItem clickable>
            <StyledLink to='/blogs'>{t('BLOG')}</StyledLink>
          </BreadcrumbItem>
          <Divider>&gt;</Divider>
          <BreadcrumbItem>{blog.title}</BreadcrumbItem>
        </Breadcrumb>

        <ThumbnailWrapper>
          <ThumbnailInner>
            <ThumbnailImage src={blog.thumbnail} alt={blog.title} />
          </ThumbnailInner>
        </ThumbnailWrapper>

        <Grid>
          <MainContent>
            <Title>{blog.title}</Title>
            <DateText>{formatDate_corner(blog.publishedAt)}</DateText>
            <Content
              id='blog-content'
              dangerouslySetInnerHTML={{ __html: blog.content || '' }}
            />
          </MainContent>

          <SideBar>
            <TableOfContents />
            <RecommendSection>
              <h2>{t('RELATED_BLOGS')}</h2>
              <ListBlogRecommend blogId={Number(blogId!)} />
            </RecommendSection>
          </SideBar>
        </Grid>
      </Container>
    </>
  );
};

export default BlogDetail;
const Container = styled.div`
  max-width: 1200px;
  margin: 0.3rem auto;
  padding: 0 1rem 2rem 1rem;
  color: ${theme.colors.textPrimary};
`;

const Breadcrumb = styled.ol`
  display: flex;
  align-items: center;
  list-style: none;
  font-size: 16px;
  margin-bottom: 1rem;
  letter-spacing: 0.3px;
  color: #aab4d0;
  padding: 0;

  li {
    margin-right: 0.5rem;
    padding: 0;
  }

  a {
    color: #8ab9ff;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.25s ease;

    &:hover {
      color: #c3dcff;
      text-shadow: 0 0 6px rgba(138, 185, 255, 0.3);
    }
  }
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  &:hover {
    text-decoration: underline;
  }
`;

const BreadcrumbItem = styled.li<{ clickable?: boolean }>`
  position: relative;
  padding: 0 0.75rem;
  font-size: 0.875rem;
  color: ${({ clickable }) =>
    clickable ? theme.colors.darkTextPrimary : theme.colors.textSecondary};
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'default')};

  &:hover {
    color: ${({ clickable }) =>
      clickable ? theme.colors.primaryHover : theme.colors.textSecondary};
  }

  &:first-child {
    padding-left: 0;
  }
`;

const Divider = styled.li`
  color: #aab4d0;
  margin-right: 0.5rem;
  opacity: 0.7;
`;

const ThumbnailWrapper = styled.div`
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 1.75rem;
  background-color: ${theme.colors.backgroundFocus};
`;

const ThumbnailInner = styled.div`
  position: relative;
  padding-top: 31.25%; /* giữ tỉ lệ */
  overflow: hidden;
`;

const ThumbnailImage = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  align-items: start;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  padding-right: 1rem;

  @media (max-width: 992px) {
    padding-right: 0;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${theme.colors.white};
  margin-bottom: 0.75rem;
`;

const DateText = styled.p`
  color: ${theme.colors.textSecondary};
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const Content = styled.div`
  font-size: 1rem;
  line-height: 1.75;
  color: #a0aec0;
  overflow: hidden;
  word-wrap: break-word;

  img {
    max-width: 100%;
    border-radius: 8px;
    margin: 12px 0;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.03);
    }
  }

  h2,
  h3 {
    margin-top: 1.25rem;
    font-weight: 600;
    color: ${theme.colors.white};
  }

  p {
    margin-bottom: 1rem;
  }

  a {
    color: ${theme.colors.primaryHover};
    text-decoration: underline;
    &:hover {
      color: ${theme.colors.primaryHoverGradient};
    }
  }
`;

const SideBar = styled.aside`
  position: sticky;
  top: 4rem;
  align-self: start;
  padding: 1rem;
  border-radius: 12px;
  background: ${theme.colors.backgroundFocus};
  border: 1px solid #374151;

  @media (max-width: 992px) {
    position: relative;
    top: 0;
    margin-top: 2rem;
  }
`;

const RecommendSection = styled.section`
  margin-top: 2rem;
  background-color: ${theme.colors.backgroundFocus};
  border-radius: 12px;
  padding: 1.5rem;

  @media (min-width: 1024px) {
    background-color: white;
    padding: 1rem;
  }

  h2 {
    color: #000;
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0;
    margin-top: 4px;

    @media (min-width: 1024px) {
      color: #000;
    }
  }
`;
