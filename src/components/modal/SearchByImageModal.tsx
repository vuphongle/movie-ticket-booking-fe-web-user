import React, { useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { Image as ImageIcon, UploadCloud, Search } from 'lucide-react';
import { theme } from '@theme/Theme';
import ModalBase from '@components/base/ModalBase';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult?: (item: any) => void;
};

const ACCEPTED = ['image/png', 'image/jpeg', 'image/jpg'];

export default function SearchByImageModal({ isOpen, onClose, onSelectResult }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);

  const [imageUrl, setImageUrl] = useState<string>('');
  const [results, setResults] = useState<any[]>([]);
  const [showResult, setShowResult] = useState(false);

//   const apiBase = useMemo(() => {
//     // ✅ bạn chỉnh theo env của bạn
//     return (import.meta as any)?.env?.VITE_API_URL || process.env.REACT_APP_API_URL || '';
//   }, []);

  const resetAll = () => {
    setImageUrl('');
    setResults([]);
    setShowResult(false);
    setLoading(false);
  };

  const handlePick = () => inputRef.current?.click();

//   const handleUpload = async (file: File) => {
//     if (!ACCEPTED.includes(file.type)) {
//       alert('Chỉ chấp nhận file ảnh (PNG, JPEG, JPG)');
//       return;
//     }

//     setLoading(true);
//     try {
//       const formData = new FormData();
//       formData.append('file', file);

//       // ✅ giống mẫu tham khảo của bạn: upload lên S3
//       const resp = await axios.post(
//         `${apiBase}:9097/api/v1/s3/upload-image`,
//         formData,
//         { headers: { 'Content-Type': 'multipart/form-data' } }
//       );

//       setImageUrl(resp.data);
//       setShowResult(false);
//       setResults([]);
//     } catch (e) {
//       console.error(e);
//       alert('Lỗi upload');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     await handleUpload(file);
//   };

//   const handleSearch = async () => {
//     if (!imageUrl) {
//       alert('Vui lòng tải lên hình ảnh trước.');
//       return;
//     }

//     setLoading(true);
//     try {
//       /**
//        * ✅ TODO: Bạn thay endpoint search-by-image theo backend GoCinema của bạn.
//        * - Trả về mảng kết quả: [{ id, name, poster, ... }]
//        *
//        * Ví dụ demo (bạn sửa):
//        */
//       const resp = await axios.get(`${apiBase}/api/v1/search/by-image`, {
//         params: { imageUrl },
//       });

//       const list = Array.isArray(resp.data) ? resp.data : resp.data?.data ?? [];
//       setResults(list);
//       setShowResult(true);
//     } catch (e) {
//       console.error(e);
//       alert('Lỗi tìm kiếm bằng ảnh');
//     } finally {
//       setLoading(false);
//     }
//   };

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={() => {
        onClose();
        resetAll();
      }}
      size="smm"
      zIndex={200}
      style={{ padding: 0 }}
    >
      <Wrap>
        {loading && (
          <LoadingOverlay>
            <Spinner />
          </LoadingOverlay>
        )}

        <Header>
          <HeaderLeft>
            <ImageIcon size={18} />
            <HeaderTitle>Tìm kiếm với hình ảnh</HeaderTitle>
          </HeaderLeft>
        </Header>

        {!showResult ? (
          <Body>
            {!imageUrl ? (
              <>
                <Hint>Vui lòng tải lên hình ảnh để tìm kiếm thông tin liên quan.</Hint>

                <PrimaryButton type="button" onClick={handlePick}>
                  <UploadCloud size={18} />
                  <span>Tải ảnh lên</span>
                </PrimaryButton>

                <HiddenInput
                  ref={inputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                //   onChange={handleFileChange}
                />
              </>
            ) : (
              <>
                <PreviewBox>
                  <PreviewImg src={imageUrl} alt="preview" />
                </PreviewBox>

                <Row>
                  <SecondaryButton type="button" onClick={handlePick}>
                    <UploadCloud size={18} />
                    <span>Chọn ảnh khác</span>
                  </SecondaryButton>

                  <HiddenInput
                    ref={inputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    // onChange={handleFileChange}
                  />
                </Row>
              </>
            )}

            <SearchButton 
                type="button" 
                // onClick={handleSearch} 
                disabled={!imageUrl}
            >
              <Search size={18} />
              <span>Tìm kiếm</span>
            </SearchButton>
          </Body>
        ) : (
          <Body>
            <PreviewBox>
              <PreviewImg src={imageUrl} alt="preview" />
            </PreviewBox>

            {results.length > 0 ? (
              <>
                <ResultTitle>Kết quả tìm kiếm:</ResultTitle>
                <ResultGrid>
                  {results.map((item, idx) => (
                    <ResultCard
                      key={item?.id ?? idx}
                      type="button"
                      onClick={() => onSelectResult?.(item)}
                      title={item?.name ?? item?.title ?? 'Xem chi tiết'}
                    >
                      <Thumb src={item?.poster || item?.thumbnail || imageUrl} alt="thumb" />
                      <ResultName>{item?.name || item?.title || 'Không có tên'}</ResultName>
                    </ResultCard>
                  ))}
                </ResultGrid>
              </>
            ) : (
              <Empty>Không tìm thấy kết quả.</Empty>
            )}

            <LinkButton
              type="button"
              onClick={() => {
                setShowResult(false);
                setResults([]);
                setImageUrl('');
              }}
            >
              Tìm kiếm với hình ảnh khác
            </LinkButton>
          </Body>
        )}
      </Wrap>
    </ModalBase>
  );
}

/* ================= styles ================= */

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
  font-size: 14px;
  line-height: 1.4;
`;

const PreviewBox = styled.div`
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.backgroundHover};
`;

const PreviewImg = styled.img`
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
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
  margin-top: 8px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  max-height: 340px;
  overflow: auto;
  padding-right: 4px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ResultCard = styled.button`
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.white};
  border-radius: 12px;
  padding: 10px;
  cursor: pointer;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 8px;

  &:hover {
    background: ${theme.colors.backgroundHover};
  }
`;

const Thumb = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 10px;
  background: ${theme.colors.backgroundHover};
`;

const ResultName = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${theme.colors.textPrimary};
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
