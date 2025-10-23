import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

interface Blog {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
}


interface BlogItemVerticalNormalProps {
  blog: Blog;
}

const BlogItemVerticalNormal: React.FC<BlogItemVerticalNormalProps> = ({ blog }) => {
  return (
    <Wrapper>
      <StyledLink to={`/blogs/${blog.id}/${blog.slug}`}>
        <ContentWrapper>
          <ThumbnailContainer>
            <ThumbnailWrapper>
              <Thumbnail src={blog.thumbnail} alt={blog.title} />
            </ThumbnailWrapper>
          </ThumbnailContainer>
          <TitleContainer>
            <Title>{blog.title}</Title>
          </TitleContainer>
        </ContentWrapper>
      </StyledLink>
    </Wrapper>
  );
};

export default BlogItemVerticalNormal;

const Wrapper = styled.div`
  cursor: pointer;
  height: 100%;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.75rem;

  @media (min-width: 640px) {
    border: none;
    padding-bottom: 0.5rem;
  }
`;

const ThumbnailContainer = styled.div`
  order: 2;
  width: 7rem;
  padding-top: 0.75rem;

  @media (min-width: 640px) {
    order: 1;
    width: 100%;
    flex: 1;
    padding-top: 0;
  }
`;

const ThumbnailWrapper = styled.div`
  position: relative;
  display: flex;
  overflow: hidden;
  border-radius: 0.375rem;
  background-color: #f3f4f6;
`;

const Thumbnail = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  aspect-ratio: 16 / 9;
`;

const TitleContainer = styled.div`
  order: 1;
  flex: 1;
  padding-right: 1.5rem;

  @media (min-width: 640px) {
    order: 2;
    width: 100%;
    flex: 1;
    padding-right: 0;
  }
`;

const Title = styled.div`
  padding-top: 0.75rem;
  padding-bottom: 0.5rem;
  font-weight: 600;
  line-height: 1.375;
  color: #111827;
  transition: color 0.2s ease;

  ${Wrapper}:hover & {
    color: #db2777;
  }
`;
