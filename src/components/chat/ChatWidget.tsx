import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { MessageCircle, Send, X, RotateCw } from 'lucide-react';
import { useGetRecommendationsMutation } from '@app/services/chat.api';
import type {
  ChatRecommendationResponse,
  RecommendedMovie,
} from '@app/services/chat.api';
import { useSelector } from 'react-redux';
import type { RootState } from '@app/Store';
import { useTranslation } from 'react-i18next';
import slugify from 'slugify';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  movies?: RecommendedMovie[];
  variant?: 'default' | 'error';
}

const GUEST_CONVERSATION_KEY = 'chat_conversation_guest';
const USER_CONVERSATION_PREFIX = 'chat_conversation_user_';

const generateId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11);

const getStorageKey = (userId?: string | null) =>
  userId ? `${USER_CONVERSATION_PREFIX}${userId}` : GUEST_CONVERSATION_KEY;

const persistConversationId = (storageKey: string, value: string) => {
  try {
    localStorage.setItem(storageKey, value);
  } catch (error) {
    console.error('Failed to persist conversationId:', error);
  }
};

const ensureConversationId = (storageKey: string) => {
  try {
    const existing = localStorage.getItem(storageKey);
    if (existing) {
      return existing;
    }
    const generated = generateId();
    persistConversationId(storageKey, generated);
    return generated;
  } catch (error) {
    console.error('Failed to access localStorage for conversationId:', error);
    return generateId();
  }
};

const createConversationId = (storageKey: string) => {
  const generated = generateId();
  persistConversationId(storageKey, generated);
  return generated;
};

const persistChatHistory = (storageKey: string, messages: ChatMessage[]) => {
  try {
    localStorage.setItem(`${storageKey}_history`, JSON.stringify(messages));
  } catch (error) {
    console.error('Failed to persist chat history:', error);
  }
};

const loadChatHistory = (storageKey: string) => {
  try {
    const raw = localStorage.getItem(`${storageKey}_history`);
    if (raw) {
      return JSON.parse(raw) as ChatMessage[];
    }
  } catch (error) {
    console.error('Failed to load chat history:', error);
  }
  return [];
};

const createGreetingMessage = (): ChatMessage => ({
  id: generateId(),
  sender: 'assistant',
  content:
    'Xin chào! Mình là trợ lý gợi ý phim. Bạn có thể mô tả thể loại, cảm xúc hoặc bất kỳ điều gì bạn muốn xem nhé!',
});

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState<string | undefined>();
  const authState = useSelector((state: RootState) => state.auth);
  const userId = authState?.auth?.id ?? null;
  const storageKey = useMemo(
    () => getStorageKey(userId ?? undefined),
    [userId]
  );
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    createGreetingMessage(),
  ]);
  const [sendRecommendation, { isLoading }] = useGetRecommendationsMutation();
  const { i18n } = useTranslation();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const cid = ensureConversationId(storageKey);
    setConversationId(cid);

    const history = loadChatHistory(storageKey);
    if (history.length > 0) {
      setMessages(history);
    } else {
      setMessages([createGreetingMessage()]);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!conversationId) return;
    persistChatHistory(storageKey, messages);
  }, [messages, storageKey, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const toggleWidget = () => {
    setIsOpen(prev => !prev);
  };

  const resetConversation = useCallback(() => {
    const newConversationId = createConversationId(storageKey);
    setConversationId(newConversationId);
    const greeting = createGreetingMessage();
    setMessages([greeting]);
    persistChatHistory(storageKey, [greeting]);
  }, [storageKey]);

  const handleSendMessage = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || !conversationId) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      sender: 'user',
      content: trimmed,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    try {
      const response: ChatRecommendationResponse = await sendRecommendation({
        message: trimmed,
        language: i18n.language,
        conversationId,
      }).unwrap();

      if (
        response.conversationId &&
        response.conversationId !== conversationId
      ) {
        setConversationId(response.conversationId);
        persistConversationId(storageKey, response.conversationId);
      }

      const assistantMessage: ChatMessage = {
        id: generateId(),
        sender: 'assistant',
        content: response.answer,
        movies: response.recommendedMovies ?? [],
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to fetch recommendations', error);
      const assistantMessage: ChatMessage = {
        id: generateId(),
        sender: 'assistant',
        content:
          'Xin lỗi, mình không thể phản hồi ngay lúc này. Bạn thử lại sau nhé!',
        variant: 'error',
      };
      setMessages(prev => [...prev, assistantMessage]);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (message: ChatMessage) => {
    const isAssistant = message.sender === 'assistant';
    return (
      <MessageBubble
        key={message.id}
        $isAssistant={isAssistant}
        $variant={message.variant}
      >
        <MarkdownContent>{message.content}</MarkdownContent>
        {isAssistant && message.movies && message.movies.length > 0 && (
          <RecommendedMovies>
            {message.movies.map(movie => {
              const posterSrc = movie.poster || '/cinema-logo.png';
              const ageRating = movie.ageRating ?? '';
              const movieRating =
                typeof movie.rating === 'number'
                  ? movie.rating.toFixed(1)
                  : null;
              const safeName = movie.name || 'Phim đề xuất';
              const detailSlug =
                movie.slug && movie.slug.trim().length
                  ? movie.slug
                  : safeName
                    ? slugify(safeName, {
                        lower: true,
                        strict: true,
                      })
                    : `phim-${movie.movieId}`;

              return (
                <MovieCard key={`${movie.movieId}-${detailSlug}`}>
                  <Poster src={posterSrc} alt={safeName} />
                  <MovieInfo>
                    <MovieTitle>{safeName}</MovieTitle>
                    {(ageRating || movieRating) && (
                      <MovieMeta>
                        {ageRating && <span>{ageRating}</span>}
                        {movieRating && <span>⭐ {movieRating}</span>}
                      </MovieMeta>
                    )}
                    {movie.genreDisplayNames?.length ? (
                      <GenreList>
                        {(movie.genreDisplayNames || []).map(genre => (
                          <span key={`${movie.movieId}-${genre}`}>{genre}</span>
                        ))}
                      </GenreList>
                    ) : null}
                    {movie.reasons?.length ? (
                      <ReasonList>
                        {(movie.reasons || []).map(reason => (
                          <li key={`${movie.movieId}-${reason}`}>{reason}</li>
                        ))}
                      </ReasonList>
                    ) : null}
                    <StyledLink to={`/movies/${movie.movieId}/${detailSlug}`}>
                      Xem chi tiết
                    </StyledLink>
                  </MovieInfo>
                </MovieCard>
              );
            })}
          </RecommendedMovies>
        )}
      </MessageBubble>
    );
  };

  return (
    <>
      <FloatingButton onClick={toggleWidget} aria-label='Trợ lý gợi ý phim'>
        <MessageCircle size={26} />
      </FloatingButton>
      {isOpen && (
        <WidgetContainer>
          <WidgetHeader>
            <div>
              <WidgetTitle>Trò chuyện cùng trợ lý phim</WidgetTitle>
              <WidgetSubtitle>
                Vui lòng cho biết độ tuổi của bạn để có gợi ý phù hợp
              </WidgetSubtitle>
            </div>
            <WidgetActions>
              <IconButton onClick={resetConversation} title='Làm mới hội thoại'>
                <RotateCw size={18} />
              </IconButton>
              <IconButton onClick={toggleWidget} title='Đóng'>
                <X size={18} />
              </IconButton>
            </WidgetActions>
          </WidgetHeader>
          <MessagesWrapper>
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </MessagesWrapper>
          <WidgetFooter>
            <MessageInput
              type='text'
              placeholder='Bạn muốn xem phim như thế nào?'
              value={inputValue}
              onChange={event => setInputValue(event.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <SendButton
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              aria-label='Gửi tin nhắn'
            >
              <Send size={20} />
            </SendButton>
          </WidgetFooter>
          {isLoading && <LoadingOverlay>Đang tìm gợi ý phim...</LoadingOverlay>}
        </WidgetContainer>
      )}
    </>
  );
};

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const FloatingButton = styled.button`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b6b, #f8c102, #4b9cfc);
  color: #0f172a;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 15px 30px rgba(15, 23, 42, 0.25);
  animation: ${pulse} 3s ease-in-out infinite;
  z-index: 1000;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 35px rgba(15, 23, 42, 0.35);
  }

  @media (max-width: 520px) {
    bottom: 16px;
    right: 16px;
  }
`;

const WidgetContainer = styled.div`
  position: fixed;
  bottom: 96px;
  right: 24px;
  width: clamp(280px, 80vw, 360px);
  max-height: 75vh;
  display: flex;
  flex-direction: column;
  background: rgba(15, 23, 42, 0.95);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 25px 50px rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(16px);
  overflow: hidden;
  z-index: 1100;

  @media (max-width: 520px) {
    right: 16px;
    bottom: 80px;
  }
`;

const WidgetHeader = styled.div`
  padding: 18px 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const WidgetTitle = styled.h3`
  margin: 0;
  color: #f8fafc;
  font-size: 16px;
  font-weight: 600;
`;

const WidgetSubtitle = styled.p`
  margin: 4px 0 0;
  color: rgba(226, 232, 240, 0.7);
  font-size: 12px;
`;

const WidgetActions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const IconButton = styled.button`
  background: rgba(148, 163, 184, 0.15);
  border: none;
  color: #f1f5f9;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.2s ease;

  svg {
    width: 18px;
    height: 18px;
    stroke: currentColor !important; /* quan trọng nhất */
    fill: none !important; /* tránh bị fill che stroke */
    stroke-width: 2.25 !important;
    flex-shrink: 0;
    opacity: 1;
    display: block;
  }

  &:hover {
    background: rgba(148, 163, 184, 0.25);
    transform: translateY(-1px);
  }
`;

const MessagesWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.3);
    border-radius: 12px;
  }
`;

const MessageBubble = styled.div<{ $isAssistant: boolean; $variant?: string }>`
  align-self: ${({ $isAssistant }) =>
    $isAssistant ? 'flex-start' : 'flex-end'};
  max-width: 92%;
  background: ${({ $isAssistant, $variant }) => {
    if ($variant === 'error') return 'rgba(239, 68, 68, 0.12)';
    return $isAssistant
      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(56, 189, 248, 0.18))'
      : 'linear-gradient(135deg, rgba(96, 165, 250, 0.9), rgba(59, 130, 246, 0.9))';
  }};
  color: ${({ $isAssistant }) => ($isAssistant ? '#e2e8f0' : '#f8fafc')};
  padding: 12px 14px;
  border-radius: 16px;
  border-bottom-left-radius: ${({ $isAssistant }) =>
    $isAssistant ? '4px' : '16px'};
  border-bottom-right-radius: ${({ $isAssistant }) =>
    $isAssistant ? '16px' : '4px'};
  font-size: 14px;
  line-height: 1.5;
  box-shadow: ${({ $variant }) =>
    $variant === 'error'
      ? '0 12px 22px rgba(239, 68, 68, 0.15)'
      : '0 12px 24px rgba(15, 23, 42, 0.35)'};
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MarkdownContent = styled(ReactMarkdown)`
  width: 100%;
  color: inherit;
  font-size: 14px;
  line-height: 1.6;
  font-weight: 400;

  p {
    margin: 0 0 8px;
  }

  p:last-child {
    margin-bottom: 0;
  }

  ul,
  ol {
    margin: 0 0 8px 18px;
    padding-left: 0;
  }

  li {
    margin-bottom: 4px;
  }

  strong,
  em {
    color: inherit;
  }

  a {
    color: #93c5fd;
    text-decoration: underline;
  }
`;

const RecommendedMovies = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MovieCard = styled.div`
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 12px;
  background: rgba(15, 23, 42, 0.35);
  border-radius: 14px;
  padding: 10px;
  border: 1px solid rgba(148, 163, 184, 0.15);
`;

const Poster = styled.img`
  width: 72px;
  height: 100px;
  object-fit: cover;
  border-radius: 12px;
`;

const MovieInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const MovieTitle = styled.h4`
  margin: 0;
  font-size: 14px;
  color: #f8fafc;
`;

const MovieMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(226, 232, 240, 0.75);
`;

const GenreList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  span {
    background: rgba(59, 130, 246, 0.15);
    color: #bfdbfe;
    padding: 2px 6px;
    border-radius: 8px;
    font-size: 11px;
  }
`;

const ReasonList = styled.ul`
  margin: 0;
  padding-left: 16px;
  color: rgba(226, 232, 240, 0.75);
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledLink = styled(Link)`
  align-self: flex-start;
  font-size: 12px;
  color: #60a5fa;
  text-decoration: none;
  font-weight: 600;

  &:hover {
    color: #93c5fd;
    text-decoration: underline;
  }
`;

const WidgetFooter = styled.div`
  padding: 14px 16px 16px;
  display: flex;
  gap: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(15, 23, 42, 0.9);
`;

const MessageInput = styled.input`
  flex: 1;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  color: #e2e8f0;
  padding: 12px 14px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: rgba(96, 165, 250, 0.7);
    box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.15);
  }

  &::placeholder {
    color: rgba(148, 163, 184, 0.7);
  }
`;

const SendButton = styled.button`
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    rgba(96, 165, 250, 0.9),
    rgba(59, 130, 246, 0.9)
  );
  border: none;
  color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  &:not(:disabled):hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 24px rgba(37, 99, 235, 0.25);
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  bottom: 82px;
  left: 0;
  right: 0;
  padding: 10px 20px;
  text-align: center;
  font-size: 12px;
  color: rgba(226, 232, 240, 0.8);
  background: linear-gradient(
    180deg,
    rgba(15, 23, 42, 0) 0%,
    rgba(15, 23, 42, 0.75) 45%,
    rgba(15, 23, 42, 0.95) 100%
  );
  pointer-events: none;
`;

export default ChatWidget;
