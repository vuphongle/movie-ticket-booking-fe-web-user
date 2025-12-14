import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { Image as ImageIcon, UploadCloud, Search, X } from 'lucide-react';
import { theme } from '@theme/Theme';
import ModalBase from '@components/base/ModalBase';
import { useSearchByImageMutation } from '@app/services/movie.api';
import { toast } from 'react-toastify';
import MovieItem from '@pages/movies/components/MovieItem';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getMovieTitle } from '@utils/functionUtils';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult?: (item: any) => void;
};

const ACCEPTED = ['image/png', 'image/jpeg', 'image/jpg'];

type PickedItem = {
  id: string;
  file: File;
  url: string;
};

export default function SearchByImageModal({
  isOpen,
  onClose,
}: Props) {
    
  const { t, i18n } = useTranslation();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const [picked, setPicked] = useState<PickedItem[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [showResult, setShowResult] = useState(false);

  const [searchByImage, { isLoading }] = useSearchByImageMutation();
  const [batchLoading, setBatchLoading] = useState(false);

  const MAX_IMAGES = 5;

  const anyLoading = isLoading || batchLoading;

  const resetAll = () => {
    picked.forEach(p => URL.revokeObjectURL(p.url));

    setPicked([]);
    setResults([]);
    setShowResult(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handlePick = () => inputRef.current?.click();

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = MAX_IMAGES - picked.length;
    if (remaining <= 0) {
      toast.info(t('ONLY_SELECT_UP_TO_MAX_IMAGES', { max: MAX_IMAGES }));
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    const valid: File[] = [];
    for (const f of files) {
      if (!ACCEPTED.includes(f.type)) {
        toast.error(t('ONLY_ACCEPT_PNG_JPEG_JPG_IMAGES'));
        continue;
      }
      valid.push(f);
    }

    if (!valid.length) {
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    const items: PickedItem[] = valid.map(file => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()
        .toString(16)
        .slice(2)}`,
      file,
      url: URL.createObjectURL(file),
    }));

    setPicked(prev => {
      const existsKey = new Set(
        prev.map(p => `${p.file.name}-${p.file.size}-${p.file.lastModified}`)
      );

      const filtered = items.filter(
        p =>
          !existsKey.has(`${p.file.name}-${p.file.size}-${p.file.lastModified}`)
      );

      const limited = filtered.slice(0, MAX_IMAGES - prev.length);

      filtered.slice(limited.length).forEach(x => URL.revokeObjectURL(x.url));

      if (filtered.length > limited.length) {
        toast.info(t('ONLY_SELECT_UP_TO_MAX_IMAGES', { max: MAX_IMAGES }));
      }

      return [...prev, ...limited];
    });

    setShowResult(false);
    setResults([]);

    if (inputRef.current) inputRef.current.value = '';
  };

  const removePicked = (id: string) => {
    setPicked(prev => {
      const target = prev.find(p => p.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter(p => p.id !== id);
    });
  };

  const dedupById = (list: any[]) => {
    const map = new Map<any, any>();
    for (const item of list) {
      const key = item?.id ?? `${item?.slug ?? ''}-${item?.name ?? ''}`;
      if (!map.has(key)) map.set(key, item);
    }
    return Array.from(map.values());
  };

  const handleSearch = async () => {
    if (!picked.length) {
      alert(t('PLEASE_SELECT_AT_LEAST_ONE_IMAGE'));
      return;
    }

    setBatchLoading(true);
    try {
      const all: any[] = [];

      for (const p of picked) {
        try {
          const res = await searchByImage(p.file).unwrap();
          const list = res?.data ?? [];
          if (Array.isArray(list)) all.push(...list);
        } catch (err) {
          console.error('Search failed for file:', p.file?.name, err);
        }
      }

      setResults(dedupById(all));
      setShowResult(true);
    } finally {
      setBatchLoading(false);
    }
  };

  const canSearch = picked.length > 0 && !anyLoading;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={() => {
        onClose();
        resetAll();
      }}
      size='smm'
      zIndex={200}
      style={{ padding: 0, position: 'relative' }}
    >
      <Wrap>
        {anyLoading && (
          <LoadingOverlay>
            <Spinner />
          </LoadingOverlay>
        )}

        <Header>
          <HeaderLeft>
            <ImageIcon size={18} />
            <HeaderTitle>{t('SEARCH_BY_IMAGE')}</HeaderTitle>
          </HeaderLeft>
        </Header>

        {!showResult ? (
          <Body>
            {!picked.length ? (
              <>
                <Hint>
                  {t('PLEASE_UPLOAD_ONE_OR_MORE_IMAGES_TO_SEARCH_FOR_MATCHING_MOVIES')}
                </Hint>

                <PrimaryButton type='button' onClick={handlePick}>
                  <UploadCloud size={18} />
                  <span>{t('UPLOAD_IMAGES')}</span>
                </PrimaryButton>

                <HiddenInput
                  ref={inputRef}
                  type='file'
                  multiple
                  accept='image/png, image/jpeg, image/jpg'
                  onChange={handleFileChange}
                />
              </>
            ) : (
              <>
                <PreviewRow>
                  {picked.map(p => (
                    <PreviewItemUpload key={p.id}>
                      <PreviewImgUpload src={p.url} alt='preview' />
                      {!showResult && (
                        <RemoveBtn
                          type='button'
                          onClick={() => removePicked(p.id)}
                          title={t('REMOVE_IMAGE')}
                        >
                          <X size={14} />
                        </RemoveBtn>
                      )}
                    </PreviewItemUpload>
                  ))}
                </PreviewRow>

                <Row>
                  <SecondaryButton type='button' onClick={handlePick}>
                    <UploadCloud size={18} />
                    <span>{t('UPLOAD_MORE_IMAGES')}</span>
                  </SecondaryButton>

                  <HiddenInput
                    ref={inputRef}
                    type='file'
                    multiple
                    accept='image/png, image/jpeg, image/jpg'
                    onChange={handleFileChange}
                  />
                </Row>
              </>
            )}

            <SearchButton
              type='button'
              onClick={handleSearch}
              disabled={!canSearch}
            >
              <Search size={18} />
              <span>{t('SEARCH')}</span>
            </SearchButton>
          </Body>
        ) : (
          <Body>
            <PreviewRow>
              {picked.map(p => (
                <PreviewItemUpload key={p.id}>
                  <PreviewImgUpload src={p.url} alt='preview' />
                </PreviewItemUpload>
              ))}
            </PreviewRow>

            {results.length > 0 ? (
              <>
                <ResultTitle>{t('SEARCH_RESULTS')}:</ResultTitle>
                <ResultGrid>
                  {results.map(item => (
                    <MovieItem
                      key={item.id}
                      title={getMovieTitle(item, i18n.language)}
                      poster={item.poster}
                      age={item.age}
                      rating={item.rating}
                      graphics={item.graphics}
                      buttonText={t('BOOK_TICKET')}
                      compact
                      onAction={() => {
                        onClose();
                        resetAll();
                        navigate(`/movies/${item.id}/${item.slug}`);
                      }}
                    />
                  ))}
                </ResultGrid>
              </>
            ) : (
              <Empty>{t('NO_RESULTS_FOUND')}</Empty>
            )}

            <LinkButton
              type='button'
              onClick={() => {
                resetAll();
              }}
            >
              {t('SEARCH_WITH_OTHER_IMAGES')}
            </LinkButton>
          </Body>
        )}
      </Wrap>
    </ModalBase>
  );
}

const Wrap = styled.div`
  padding: 18px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid ${theme.colors.border};
`;

const HeaderLeft = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const HeaderTitle = styled.div`
  font-weight: 800;
  font-size: 16px;
  color: ${theme.colors.textPrimary};
`;

const Body = styled.div`
  padding-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Hint = styled.p`
  margin: 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.4;
`;

const RemoveBtn = styled.button`
  position: absolute;
  top: 6px;
  right: 6px;

  width: 26px;
  height: 26px;
  padding: 0;
  border-radius: 999px;

  border: 1px solid rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.18) !important;
  cursor: pointer;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  color: #ef4444 !important;
  z-index: 2;

  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;

  svg {
    width: 14px;
    height: 14px;
    display: block;
  }

  svg,
  svg * {
    stroke: currentColor !important;
    fill: none !important;
    opacity: 1 !important;
    visibility: visible !important;
  }

  &:hover {
    background: rgba(239, 68, 68, 0.28) !important;
    box-shadow: 0 4px 10px rgba(239, 68, 68, 0.25);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const Row = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
`;

const PrimaryButton = styled.button`
  border: 1px solid rgba(59, 130, 246, 0.4);
  background: rgba(59, 130, 246, 0.08);
  color: #2563eb;
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 700;

  &:hover {
    background: rgba(59, 130, 246, 0.14);
  }
`;

const SecondaryButton = styled(PrimaryButton)`
  width: 100%;
`;

const SearchButton = styled.button<{ disabled?: boolean }>`
  border: none;
  background: ${theme.colors.primary};
  color: ${theme.colors.white};
  padding: 10px 12px;
  border-radius: 999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 800;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};

  &:hover {
    background: ${theme.colors.primaryHover};
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const ResultTitle = styled.div`
  font-weight: 800;
  margin-top: 6px;
`;

const ResultGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  max-height: 340px;
  overflow: auto;
  padding-right: 4px;
  background: rgba(0, 0, 0, 0.05);
  padding: 16px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const Empty = styled.div`
  margin-top: 12px;
  color: #ef4444;
  font-weight: 700;
`;

const LinkButton = styled.button`
  margin-top: 6px;
  border: none;
  background: transparent;
  color: #2563eb;
  cursor: pointer;
  font-weight: 800;

  &:hover {
    text-decoration: underline;
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
`;

const Spinner = styled.div`
  width: 52px;
  height: 52px;
  border: 4px solid rgba(59, 130, 246, 0.35);
  border-top-color: rgba(59, 130, 246, 1);
  border-radius: 999px;
  animation: spin 0.9s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const PreviewRow = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;

  -webkit-overflow-scrolling: touch;

  scrollbar-width: thin;
`;

const PreviewItemUpload = styled.div`
  position: relative;
  flex: 0 0 160px;
  width: 160px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.backgroundHover};
`;

const PreviewImgUpload = styled.img`
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
`;
