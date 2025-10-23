import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useGetLatestBlogsQuery } from '@app/services/blog.api';
import Error from '@components/errors/Error';
import Loading from '@components/loading/Loading';
import ListBlogItem from './ListBlogItem';
import type{ Blog } from './ListBlogItem';

// interface BlogPageData {
//   content: Blog[];
//   last: boolean;
// }

interface ListBlogLatestProps {
  type: string;
  limit: number;
  col: number;
}

const ListBlogLatest: React.FC<ListBlogLatestProps> = ({ type, limit, col }) => {
  const params = useParams();
  const [page, setPage] = useState<number>(1);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isShowLoadMore, setIsShowLoadMore] = useState<boolean>(true);

  const { data: pageData, isLoading, isFetching, isError } = useGetLatestBlogsQuery({
    page,
    limit,
    type,
  });

  useEffect(() => {
    setPage(1);
    setBlogs([]);
    setIsShowLoadMore(true);
  }, [params]);

  useEffect(() => {
    if (pageData && pageData.content) {
      setBlogs((prevBlogs) => [...prevBlogs, ...pageData.content]);
      setIsShowLoadMore(!pageData.last);
    }
  }, [pageData]);

  if (isLoading) return <Loading />;
  if (isError) return <Error />;

  const handleLoadMore = () => setPage((prev) => prev + 1);

  return (
    <>
      {blogs.length > 0 && (
        <>
          <GridContainer col={col}>
            <ListBlogItem blogs={blogs} type="BLOG_ITEM_VERTICAL_NORMAL" />
          </GridContainer>

          {isShowLoadMore && (
            <LoadMoreWrapper>
              <LoadMoreButton type="button" onClick={handleLoadMore}>
                {isFetching ? (
                  <Spinner>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 
                        0 0 5.373 0 12h4zm2 5.291A7.962 
                        7.962 0 014 12H0c0 3.042 1.135 
                        5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </Spinner>
                ) : (
                  <ArrowIcon
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 10.293a1 1 0 
                      010 1.414l-6 6a1 1 0 
                      01-1.414 0l-6-6a1 1 0 
                      111.414-1.414L9 14.586V3a1 
                      1 0 012 0v11.586l4.293-4.293a1 
                      1 0 011.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </ArrowIcon>
                )}
                Xem thêm!
              </LoadMoreButton>
            </LoadMoreWrapper>
          )}
        </>
      )}
    </>
  );
};

export default ListBlogLatest;

/* ---------------------- STYLED COMPONENTS ---------------------- */

const GridContainer = styled.div<{ col: number }>`
  display: grid;
  grid-template-columns: ${({ col }) => `repeat(${col}, minmax(0, 1fr))`};
  gap: 1.5rem;
`;

const LoadMoreWrapper = styled.div`
  padding-top: 1.5rem;
  display: flex;
  justify-content: center;
`;

const LoadMoreButton = styled.button`
  border-radius: 9999px;
  border: 1px solid #ec4899;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 1.5rem;
  font-weight: 600;
  color: #ec4899;
  transition: all 0.2s;

  &:hover {
    color: #db2777;
  }

  display: flex;
  align-items: center;
  justify-content: center;
`;

const Spinner = styled.span`
  display: inline-block;
  margin-right: 0.5rem;
  width: 1.25rem;
  height: 1.25rem;

  svg {
    animation: spin 1s linear infinite;
    color: currentColor;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ArrowIcon = styled.svg`
  margin-right: 0.5rem;
  width: 1rem;
  height: 1rem;
  opacity: 0.8;
  animation: bounce 1s infinite;

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-0.25rem);
    }
  }
`;
