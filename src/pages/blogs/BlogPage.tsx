import { useState } from "react";
import styled from "styled-components";
import { useGetAllBlogsQuery } from "@app/services/blog.api";
import type { BlogDto } from "@app/services/blog.api";
import { useTranslation } from "react-i18next";
import { theme } from "@/theme/Theme";

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
      <Heading>{t("BLOG_TITLE")}</Heading>

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

      <BlogList>
        {!blogs?.content?.length && <EmptyText>{t("BLOG_EMPTY")}</EmptyText>}
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
  color: ${theme.colors.white};
`;

const Heading = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: ffffff;
`;

const SearchBox = styled.div`
  margin: 1rem 0;
  input {
    width: 100%;
    padding: 0.6rem;
    font-size: 1rem;
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.borderRadius.medium};
    background: ${theme.colors.backgroundFocus};
    color: ${theme.colors.white};
    ::placeholder {
      color: ${theme.colors.gray};
    }
  }
`;

const BlogList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const EmptyText = styled.p`
  text-align: center;
  color: ${theme.colors.gray};
`;

const BlogCard = styled.div`
  display: flex;
  gap: 1rem;
  cursor: pointer;
  background: ${theme.colors.backgroundFocus};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.medium};

  img {
    width: 180px;
    height: 120px;
    object-fit: cover;
    border-radius: ${theme.borderRadius.small};
  }

  .info {
    flex: 1;
    h3 {
      margin: 0 0 0.5rem;
      font-size: 1.1rem;
      color: ${theme.colors.primaryHover};
    }
    p {
      margin: 0;
      color: ${theme.colors.textSecondary};
      font-size: 0.95rem;
    }
  }
`;

const Pagination = styled.div`
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.md};
  color: ${theme.colors.white};

  button {
    padding: 0.5rem 1rem;
    border: 1px solid ${theme.colors.border};
    background: ${theme.colors.backgroundFocus};
    border-radius: ${theme.borderRadius.small};
    color: ${theme.colors.white};
    cursor: pointer;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  span {
    align-self: center;
  }
`;
