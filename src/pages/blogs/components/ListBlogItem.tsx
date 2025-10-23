import React from 'react';
import BlogItemHorizontal from './BlogItemHorizontal';
import BlogItemSideBar from './BlogItemSideBar';
import BlogItemVertical from './BlogItemVertical';
import BlogItemVerticalNormal from './BlogItemVerticalNormal';

export interface Blog {
  id: number;
  slug: string;
  title: string;
  thumbnail: string;
  description: string;
  publishedAt: string;
}

interface BlogItemProps {
  blog: Blog;
  index: number;
  showRank?: boolean;
}

interface ListBlogItemProps {
  blogs: Blog[];
  showRank?: boolean;
  type: 'BLOG_ITEM_SIDE_BAR' | 'BLOG_ITEM_HORIZONTAL' | 'BLOG_ITEM_VERTICAL' | 'BLOG_ITEM_VERTICAL_NORMAL';
}

const ListBlogItem: React.FC<ListBlogItemProps> = ({ blogs, showRank, type }) => {
  // Mapping giữa type và component tương ứng
  const blogItemComponents: Record<ListBlogItemProps['type'], React.ComponentType<BlogItemProps>> = {
    BLOG_ITEM_SIDE_BAR: BlogItemSideBar,
    BLOG_ITEM_HORIZONTAL: BlogItemHorizontal,
    BLOG_ITEM_VERTICAL: BlogItemVertical,
    BLOG_ITEM_VERTICAL_NORMAL: BlogItemVerticalNormal,
  };

  const SelectedBlogItem = blogItemComponents[type];

  return (
    <>
      {blogs && SelectedBlogItem &&
        blogs.map((blog, index) => (
          <SelectedBlogItem
            blog={blog}
            key={blog.id}
            index={index}
            showRank={showRank}
          />
        ))}
    </>
  );
};

export default ListBlogItem;
