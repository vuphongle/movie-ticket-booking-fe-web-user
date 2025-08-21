import { useState } from "react";
import styled from "styled-components";
import { useGetAllBlogsQuery } from "@app/services/blog.api";
import type { BlogDto } from "@app/services/blog.api";
import { useTranslation } from "react-i18next";

export default function BlogPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data: blogs, isLoading } = useGetAllBlogsQuery({
    page,
    limit: 15,
    type: search || undefined,
  });

  if (isLoading) return <div>{t("BLOG_LOADING")}</div>;

  return (
    <Container>
      <h2>{t("BLOG_TITLE")}</h2>

      {/* Ô tìm kiếm */}
      <SearchBox>
        <input
          type="text"
          placeholder={t("BLOG_SEARCH_PLACEHOLDER")}
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
      </SearchBox>

      {/* Danh sách blog */}
      <BlogList>
        {!blogs?.content?.length && <p>{t("BLOG_EMPTY")}</p>}
        {blogs?.content?.map((blog: BlogDto) => (
          <BlogCard key={blog.id}>
            <img src={blog.thumbnail} alt={blog.title} />
            <div className="info">
              <h3>{blog.title}</h3>
              <p>{blog.description}</p>
            </div>
          </BlogCard>
        ))}
      </BlogList>

      {/* Pagination */}
      {blogs && (
        <Pagination>
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            {t("BLOG_PREV")}
          </button>
          <span>
            {t("BLOG_PAGE")} {page}/{blogs.totalPages}
          </span>
          <button
            disabled={page === blogs.totalPages}
            onClick={() => setPage((prev) => prev + 1)}
          >
            {t("BLOG_NEXT")}
          </button>
        </Pagination>
      )}
    </Container>
  );
}

const Container = styled.div`
  max-width: 1000px;
  margin: 2rem auto;
  padding: 0 1rem;
`;

const SearchBox = styled.div`
  margin: 1rem 0;
  input {
    width: 100%;
    padding: 0.6rem;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 6px;
  }
`;

const BlogList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const BlogCard = styled.div`
  display: flex;
  gap: 1rem;
  cursor: pointer;

  img {
    width: 180px;
    height: 120px;
    object-fit: cover;
    border-radius: 6px;
  }

  .info {
    flex: 1;
    h3 {
      margin: 0 0 0.5rem;
      font-size: 1.1rem;
      color: #0a58ca;
    }
    p {
      margin: 0;
      color: #555;
      font-size: 0.95rem;
    }
  }
`;

const Pagination = styled.div`
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 1rem;

  button {
    padding: 0.5rem 1rem;
    border: 1px solid #ccc;
    background: #f8f8f8;
    border-radius: 5px;
    cursor: pointer;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;
