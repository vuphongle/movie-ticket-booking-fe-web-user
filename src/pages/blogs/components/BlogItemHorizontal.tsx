import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { formatDate_corner } from "@/utils/functionUtils";

// Định nghĩa kiểu dữ liệu cho blog
interface Blog {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
}

interface BlogItemHorizontalProps {
  blog: Blog;
}

const BlogItemHorizontal: React.FC<BlogItemHorizontalProps> = ({ blog }) => {
  return (
    <Article>
      <FlexContainer>
        <TextContent>
          <Header>
            <StyledLink to={`/blogs/${blog.id}/${blog.slug}`}>
              <Title>{blog.title}</Title>
            </StyledLink>
          </Header>
          <Description>{blog.description}</Description>
          <DateText>{formatDate_corner(blog.publishedAt)}</DateText>
        </TextContent>

        <ThumbnailWrapper>
          <StyledLink to={`/blogs/${blog.id}/${blog.slug}`}>
            <Thumbnail>
              <img src={blog.thumbnail} alt={blog.title} />
            </Thumbnail>
          </StyledLink>
        </ThumbnailWrapper>
      </FlexContainer>
    </Article>
  );
};

export default BlogItemHorizontal;

//
// ---------------- Styled Components ----------------
//

const Article = styled.article`
  padding: 1.5rem 0;
  border-bottom: 1px solid #e5e7eb;
`;

const FlexContainer = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-start;
`;

const TextContent = styled.div`
  flex: 1;
  order: 2;
  padding-left: 1.25rem;
  max-width: 42rem;
`;

const Header = styled.header`
  margin-bottom: 0.5rem;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;

  &:hover h3 {
    text-decoration: underline;
  }
`;

const Title = styled.h3`
  font-weight: 600;
  color: #1f2937;
  font-size: 1.125rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Description = styled.div`
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const DateText = styled.div`
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
`;

const ThumbnailWrapper = styled.div`
  order: 1;
  flex-shrink: 0;
  width: 13rem;
  position: relative;
`;

const Thumbnail = styled.div`
  position: relative;
  overflow: hidden;
  background-color: #f3f4f6;
  aspect-ratio: 16 / 9;
  border-radius: 0.375rem;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;
