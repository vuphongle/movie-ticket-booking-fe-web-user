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

interface BlogItemVerticalProps {
  blog: Blog;
}

const BlogItemVertical: React.FC<BlogItemVerticalProps> = ({ blog }) => {
  return (
    <Article key={blog.id}>
      <Link to={`/blogs/${blog.id}/${blog.slug}`}>
        <ThumbnailWrapper>
          <ThumbnailImage src={blog.thumbnail} alt={blog.title} />
        </ThumbnailWrapper>
      </Link>

      <Content>
        <Link to={`/blogs/${blog.id}/${blog.slug}`}>
          <Title>{blog.title}</Title>
        </Link>
        <DateText>{formatDate_corner(blog.publishedAt)}</DateText>
        <Description>{blog.description}</Description>
      </Content>
    </Article>
  );
};

export default BlogItemVertical;

const Article = styled.article`
  display: block;
`;

const ThumbnailWrapper = styled.div`
  overflow: hidden;
  background-color: #f3f4f6;
  aspect-ratio: 16 / 9;
  border-radius: 0.375rem;
`;

const ThumbnailImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Content = styled.div`
  margin-top: 0.5rem;
  max-width: 42rem;
`;

const Title = styled.h3`
  font-weight: 600;
  line-height: 1.25;
  color: #1f2937;
  font-size: 1.25rem;

  @media (min-width: 768px) {
    font-size: 1.125rem;
    line-height: 1.25rem;
  }

  @media (min-width: 1024px) {
    font-size: 1.25rem;
  }

  &:hover {
    text-decoration: underline;
  }
`;

const DateText = styled.div`
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
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
