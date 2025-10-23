import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { formatDate_corner } from "@utils/functionUtils";

interface Blog {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
}

interface BlogItemSideBarProps {
  blog: Blog;
  index: number;
  showRank?: boolean;
}

const BlogItemSideBar: React.FC<BlogItemSideBarProps> = ({ blog, index, showRank }) => {
  return (
    <Wrapper key={blog.id}>
      <FlexContainer>
        <ThumbnailWrapper>
          <Link to={`/blogs/${blog.id}/${blog.slug}`}>
            <ThumbnailBox>
              <ThumbnailImage src={blog.thumbnail} alt={blog.title} />
              {showRank && <RankOverlay>{index + 1}</RankOverlay>}
            </ThumbnailBox>
          </Link>
        </ThumbnailWrapper>

        <Content>
          <div>
            <Link to={`/blogs/${blog.id}/${blog.slug}`}>
              <Title>{blog.title}</Title>
              <DateText>{formatDate_corner(blog.publishedAt)}</DateText>
            </Link>
          </div>
        </Content>
      </FlexContainer>
    </Wrapper>
  );
};

export default BlogItemSideBar;

const Wrapper = styled.div`
  padding: 0.5rem 0;
  @media (min-width: 768px) {
    padding: 0.75rem 0;
  }
`;

const FlexContainer = styled.div`
  display: flex;
  flex-wrap: nowrap;
`;

const ThumbnailWrapper = styled.div`
  position: relative;
  flex: 0 0 auto;
  order: 1;
  width: 9rem; /* ~w-36 */
`;

const ThumbnailBox = styled.div`
  position: relative;
  overflow: hidden;
  background-color: #f3f4f6; /* gray-100 */
  aspect-ratio: 16 / 9;
  border-radius: 0.375rem; /* rounded-md */
`;

const ThumbnailImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RankOverlay = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: flex-end;
  width: 100%;
  height: 100%;
  padding: 0.75rem;
  font-size: 1.875rem; /* text-3xl */
  font-weight: 600;
  color: white;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.6),
    rgba(0, 0, 0, 0.1)
  );
`;

const Content = styled.div`
  flex: 1;
  padding-left: 1rem;
  order: 2;
  @media (min-width: 768px) {
    padding-left: 1.25rem;
  }
`;

const Title = styled.h3`
  font-weight: 600;
  line-height: 1.25;
  color: #1f2937; /* gray-800 */
  font-size: 0.875rem;

  @media (min-width: 768px) {
    font-size: 1.125rem; /* text-lg */
  }
  @media (min-width: 1024px) {
    font-size: 0.875rem; /* lg:text-sm */
  }

  &:hover {
    text-decoration: underline;
  }

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const DateText = styled.div`
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #4b5563; /* gray-600 */
`;
