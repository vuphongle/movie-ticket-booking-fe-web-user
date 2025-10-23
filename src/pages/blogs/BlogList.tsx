import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useGetAllBlogsQuery } from '@app/services/blog.api';
import Loading from '@components/loading/Loading';
import { formatDate_corner } from '@utils/functionUtils';
import ListBlogMostView from './components/ListBlogMostView';
import { theme } from '@theme/Theme';
import { useTranslation } from 'react-i18next';

interface Blog {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
}

const BlogList: React.FC = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState<number>(1);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isShowLoadMore, setIsShowLoadMore] = useState<boolean>(true);
  //   const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const {
    data: pageData,
    isLoading,
    isError,
    isFetching,
  } = useGetAllBlogsQuery({
    page,
    limit: 10,
    type: 'all',
  });

  useEffect(() => {
    setPage(1);
    setBlogs([]);
    setIsShowLoadMore(true);
  }, []);

  useEffect(() => {
    if (pageData && pageData.content) {
      setBlogs(prevBlogs => [...prevBlogs, ...pageData.content]);
      setIsShowLoadMore(!pageData.last);
    }
  }, [pageData]);

  if (isLoading) return <Loading />;
  if (isError) return <div>Error loading blogs.</div>;

  const handleLoadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  return (
    <>
      <Helmet>
        <title>{t('BLOG_MOVIES_TITLE')}</title>
      </Helmet>

      <Container>
        {/* Breadcrumb */}
        <Breadcrumb>
          <li>
            <StyledLink to='/'>{t('HOME')}</StyledLink>
          </li>
          <Separator>&gt;</Separator>
          <li>
            <span>{t('BLOG')}</span>
          </li>
        </Breadcrumb>

        {/* Header */}
        <HeaderSection>
          <h1>{t('BLOG_MOVIES')}</h1>
          <p>{t('BLOG_MOVIES_DESC')}</p>
        </HeaderSection>

        {/* Tabs */}
        <TabBar>
          <TabList>
            <Tab to='/blogs' $active={location.pathname === '/blogs'}>
              {t('BLOG_LATEST')}
            </Tab>
            <Tab
              to='/blogs/theater-movies'
              $active={location.pathname === '/blogs/theater-movies'}
            >
              {t('BLOG_THEATER')}
            </Tab>
            <Tab
              to='/blogs/movies-summary'
              $active={location.pathname === '/blogs/movies-summary'}
            >
              {t('BLOG_MOVIES_SUMMARY')}
            </Tab>
            <Tab
              to='/blogs/netflix-movies'
              $active={location.pathname === '/blogs/netflix-movies'}
            >
              {t('BLOG_NETFLIX')}
            </Tab>
          </TabList>
        </TabBar>

        {/* Top Blogs */}
        <TopBlogs>
          {blogs.length > 0 &&
            blogs.slice(0, 3).map(blog => (
              <Article key={blog.id}>
                <StyledLink to={`/blogs/${blog.id}/${blog.slug}`}>
                  <Thumbnail>
                    <img src={blog.thumbnail} alt={blog.title} />
                  </Thumbnail>
                </StyledLink>

                <ArticleContent>
                  <h3>
                    <StyledLink to={`/blogs/${blog.id}/${blog.slug}`}>
                      {blog.title}
                    </StyledLink>
                  </h3>
                  <small>{formatDate_corner(blog.publishedAt)}</small>
                  <p>{blog.description}</p>
                </ArticleContent>
              </Article>
            ))}
        </TopBlogs>

        <Divider />

        {/* Main Content */}
        <MainContent>
          <BlogColumn>
            <h2>{t('BLOG_POSTS')}</h2>
            {blogs.length > 0 &&
              blogs.slice(3).map(blog => (
                <BlogItem key={blog.id}>
                  <ThumbnailSmall>
                    <Link to={`/blogs/${blog.id}/${blog.slug}`}>
                      <img src={blog.thumbnail} alt={blog.title} />
                    </Link>
                  </ThumbnailSmall>
                  <BlogInfo>
                    <h3>
                      <StyledLink to={`/blogs/${blog.id}/${blog.slug}`}>
                        {blog.title}
                      </StyledLink>
                    </h3>
                    <p>{blog.description}</p>
                    <small>{formatDate_corner(blog.publishedAt)}</small>
                  </BlogInfo>
                </BlogItem>
              ))}

            {isShowLoadMore && (
              <LoadMoreWrapper>
                <LoadMoreButton onClick={handleLoadMore}>
                  {isFetching ? (
                    <Spinner />
                  ) : (
                    <ArrowIcon
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M16.707 10.293a1 1 0 
                      010 1.414l-6 6a1 1 0 
                      01-1.414 0l-6-6a1 1 0 
                      111.414-1.414L9 14.586V3a1 
                      1 0 012 0v11.586l4.293-4.293a1 
                      1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </ArrowIcon>
                  )}
                  {t('BLOG_VIEW_MORE')}
                </LoadMoreButton>
              </LoadMoreWrapper>
            )}
          </BlogColumn>

          <Sidebar>
            <SidebarBox>
              <h2>{t('BLOG_MOST_VIEWED')}</h2>
              <ListBlogMostView type='PHIM_CHIEU_RAP' />
            </SidebarBox>
          </Sidebar>
        </MainContent>
      </Container>
    </>
  );
};

export default BlogList;

const Container = styled.div`
  max-width: 1200px;
  margin: 0.3rem auto;
  padding: 0 1rem;
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

const Separator = styled.span`
  color: #aab4d0;
  margin-right: 0.5rem;
  opacity: 0.7;
`;

const HeaderSection = styled.div`
  margin: 2rem 0;
  h1 {
    font-size: 2rem;
    font-weight: bold;
    color: white;
  }
  p {
    max-width: 700px;
    color: ${theme.colors.textSecondary};
  }
`;
const TabBar = styled.div`
  position: sticky;
  top: 0;
  background: #0f172a;
  padding: 14px 0;
  border-bottom: 5px solid #374151;
  z-index: 10;
  backdrop-filter: blur(8px);
  border-radius: 12px;
  margin-bottom: 2rem;
`;

const TabList = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.sm};
`;

// Tab as Link
const Tab = styled(Link)<{ $active?: boolean }>`
  position: relative;
  padding: 12px 30px;
  border-radius: 12px;
  font-size: 1.25rem;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  text-decoration: none;
  color: ${({ $active }) =>
    $active ? theme.colors.textLight : theme.colors.darkTextPrimary};
  background: ${({ $active }) =>
    $active ? theme.colors.primary : theme.colors.darkCardBg};
  transform: ${({ $active }) =>
    $active ? 'translateY(-2px)' : 'translateY(0)'};
  box-shadow: ${({ $active }) =>
    $active ? '0 4px 10px rgba(0,0,0,0.3)' : 'none'};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px) scale(1.04);
    background: ${({ $active }) =>
      $active ? theme.colors.primaryHover : theme.colors.primaryHoverGradient};
    color: ${theme.colors.textLight};
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
  }

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 6px;
    width: ${({ $active }) => ($active ? '60%' : '0%')};
    height: 3px;
    background: ${theme.colors.textLight};
    border-radius: 2px;
    transform: translateX(-50%);
    transition: width 0.3s ease;
  }

  &:hover::after {
    width: ${({ $active }) => ($active ? '60%' : '40%')};
  }
`;
const TopBlogs = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const Article = styled.article`
  display: flex;
  flex-direction: column;
  background: rgba(30, 58, 138, 0.25);
  border-radius: 10px;
  border: 1px solid #3b82f6;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  transition: transform 0.3s ease;
  &:hover {
    transform: translateY(-4px);
    background: rgba(30, 58, 138, 0.4);
  }
`;

const Thumbnail = styled.div`
  border-radius: 8px 8px 0 0;
  overflow: hidden;
  aspect-ratio: 16/9;
  background-color: rgba(255, 255, 255, 0.08);
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  ${Article}:hover & img {
    transform: scale(1.05);
  }
`;

const ArticleContent = styled.div`
  padding: 1rem;

  h3 {
    color: white;
    font-size: 1.1rem;
    margin-bottom: 0.25rem;
  }

  small {
    display: block;
    color: ${theme.colors.textSecondary};
  }

  p {
    color: ${theme.colors.textSecondary};
    margin-top: 0.25rem;
  }
`;
const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${theme.colors.border};
  margin: 2rem 0;
`;
const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  &:hover {
    text-decoration: underline;
  }
`;

const MainContent = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
  margin-bottom: 3rem;

  @media (max-width: 992px) {
    flex-direction: column;
  }
`;

const BlogColumn = styled.div`
  flex: 3;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${theme.colors.white};
    margin-bottom: 0px;
    margin-top: 0px;
  }
`;

const BlogItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: ${theme.borderRadius.small};
  background: ${theme.colors.backgroundFocus};
  border: 1px solid #374151;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    background: rgba(30, 58, 138, 0.3);
    border-color: #3b82f6;
  }

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const ThumbnailSmall = styled.div`
  width: 200px;
  height: 120px;
  flex-shrink: 0;
  border-radius: ${theme.borderRadius.small};
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  ${BlogItem}:hover & img {
    transform: scale(1.05);
  }

  @media (max-width: 600px) {
    width: 100%;
    height: auto;
    aspect-ratio: 16 / 9;
  }
`;

const BlogInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: ${theme.colors.primaryHover};
    margin: 0;

    &:hover {
      text-decoration: underline;
    }
  }

  p {
    color: ${theme.colors.textSecondary};
    margin: 0;
    line-height: 1.5;
  }

  small {
    font-size: 0.85rem;
    color: ${theme.colors.textSecondary};
  }
`;

const Sidebar = styled.aside`
  position: sticky;
  top: 5.5rem;
  margin-top: 50px;
  margin-bottom: 65px;
  flex: 1.2;
  padding: 1rem;
  border-radius: ${theme.borderRadius.medium};
  background: ${theme.colors.backgroundFocus};
  border: 1px solid #374151;
  height: fit-content;

  h2 {
    font-size: 1.2rem;
    font-weight: 700;
    color: ${theme.colors.white};
    margin-bottom: 1rem;
  }

  @media (max-width: 992px) {
    margin-top: 2rem;
  }
`;

const LoadMoreButton = styled.button`
  display: inline-block;
  margin-left: 0;
  margin-right: auto;
  padding: 0.6rem 1.5rem;
  border-radius: 9999px;
  border: 1px solid #60a5fa;
  color: white;
  background: ${theme.colors.primaryHoverGradient};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  letter-spacing: 0.3px;
  margin-bottom: 0px;
  margin-top: 0px;

  &:hover {
    filter: brightness(1.08);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SidebarBox = styled.aside`
  top: 5.5rem;
  flex: 1.2;
  padding: 1rem;
  border-radius: ${theme.borderRadius.medium};
  background: ${theme.colors.backgroundFocus};
  border: 1px solid #374151;
  height: fit-content;

  h2 {
    font-size: 1.2rem;
    font-weight: 700;
    color: ${theme.colors.white};
    margin-bottom: 1rem;
  }

  h3 {
    color: rgba(255, 255, 255, 0.8);
  }

  h3:hover {
    color: ${theme.colors.primaryHover};
    text-decoration: underline;
  }

  @media (max-width: 992px) {
    margin-top: 2rem;
  }
`;

const LoadMoreWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const Spinner = styled.div`
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  margin-right: 8px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ArrowIcon = styled.svg`
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
  opacity: 0.8;
  animation: bounce 1s infinite;

  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-0.25rem);
    }
  }
`;
