import React from "react";
import styled from "styled-components";
import { useGetMostViewBlogsQuery } from "@app/services/blog.api";
import ListBlogItem from "./ListBlogItem";

interface ListBlogMostViewProps {
  type: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ListBlogMostView: React.FC<ListBlogMostViewProps> = ({ type }) => {
  const { data: blogs } = useGetMostViewBlogsQuery({ type, limit: 5 });

  if (!blogs || blogs.length === 0) {
    return null;
  }

  return (
    <Container>
      <ListBlogItem blogs={blogs} type="BLOG_ITEM_SIDE_BAR" />
    </Container>
  );
};

export default ListBlogMostView;
