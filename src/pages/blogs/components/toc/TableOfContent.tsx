import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import slugify from 'slugify';
import styled from 'styled-components';
import { theme } from '@theme/Theme';
import { useTranslation } from 'react-i18next';

const TableOfContents: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const headingsArray: Heading[] = [];

    const traverseHeadings = (elements: NodeListOf<HTMLHeadingElement>) => {
      elements.forEach(heading => {
        const level = parseInt(heading.tagName.charAt(1));
        const id =
          heading.id ||
          slugify(heading.textContent || '', { lower: true, strict: true });
        heading.id = id;
        const text = heading.textContent || '';

        headingsArray.push({
          id,
          text,
          level,
          element: heading,
        });
      });
    };

    const contentEl = document.getElementById('blog-content');
    if (!contentEl) return;

    const topLevelHeadings =
      contentEl.querySelectorAll<HTMLHeadingElement>('h2, h3, h4');
    traverseHeadings(topLevelHeadings);
    setHeadings(headingsArray);
  }, [location.pathname]);

  useEffect(() => {
    if (!headings.length) return;

    observer.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveHeadingId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0% -35% 0px' }
    );

    headings.forEach(heading => {
      observer.current?.observe(heading.element);
    });

    return () => {
      observer.current?.disconnect();
    };
  }, [headings]);

  const scrollToHeading = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const renderHeadings = (headings: Heading[]) => (
    <TocList>
      {headings.map(heading => (
        <TocItem key={heading.id} level={heading.level}>
          <TocLink
            href={`#${heading.id}`}
            active={activeHeadingId === heading.id}
            onClick={e => scrollToHeading(e, heading.id)}
          >
            {heading.text}
          </TocLink>
        </TocItem>
      ))}
    </TocList>
  );

  return (
    <>
      {headings.length > 0 && (
        <TocWrapper>
          <TocTitle>{t('TABLE_OF_CONTENTS')}</TocTitle>
          <div id='toc-container'>{renderHeadings(headings)}</div>
        </TocWrapper>
      )}
    </>
  );
};

export default TableOfContents;

interface Heading {
  id: string;
  text: string;
  level: number;
  element: HTMLElement;
}

const TocWrapper = styled.div`
  margin-bottom: 1rem;
`;

const TocTitle = styled.h2`
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
  font-weight: bold;
  color: #a0aec0;
`;

const TocList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const TocItem = styled.li<{ level: number }>`
  margin-left: ${({ level }) => (level - 2) * 20}px;
`;

const TocLink = styled.a<{ active?: boolean }>`
  display: block;
  font-size: 1rem;
  padding: 0.6rem 0;
  padding-left: 0.5rem;
  text-decoration: none;
  color: ${({ active }) =>
    active ? theme.colors.primaryHover : theme.colors.textSecondary};
  border-left: 2px solid
    ${({ active }) => (active ? theme.colors.primaryHover : 'transparent')};
  transition:
    color 0.2s,
    border-color 0.2s;

  &:hover {
    color: ${theme.colors.primaryHoverGradient};
    border-color: ${theme.colors.primaryHoverGradient};
  }
`;
