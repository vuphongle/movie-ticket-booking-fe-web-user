import { useTranslation } from 'react-i18next';

export default function LanguageSelector() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <select
      value={i18n.language}
      onChange={e => changeLanguage(e.target.value)}
      className='p-2 rounded border'
    >
      <option value='vi'>🇻🇳 Tiếng Việt</option>
      <option value='en'>🇺🇸 English</option>
    </select>
  );
}
