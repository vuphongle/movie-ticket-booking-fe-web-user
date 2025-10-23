import React, { useEffect } from "react";
import styled from "styled-components";
import { useLocation } from "react-router-dom";
import { useGetRecommendBlogsQuery } from "@app/services/blog.api";
import ListBlogItem from "./ListBlogItem";

interface ListBlogRecommendProps {
  blogId: number;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ListBlogRecommend: React.FC<ListBlogRecommendProps> = ({ blogId }) => {
  const location = useLocation();
  const { data: blogs, refetch } = useGetRecommendBlogsQuery({
    id: blogId,
    limit: 5,
  });

  useEffect(() => {
    refetch();
  }, [location.pathname, refetch]);

  if (!blogs || blogs.length === 0) {
    return null;
  }

  return (
    <Container>
      <ListBlogItem blogs={blogs} showRank={false} type="BLOG_ITEM_SIDE_BAR" />
    </Container>
  );
};

export default ListBlogRecommend;
