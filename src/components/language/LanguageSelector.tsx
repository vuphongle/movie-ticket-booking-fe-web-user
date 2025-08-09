import { theme } from '@theme/Theme';
import { useTranslation } from 'react-i18next';
import Select, { components } from 'react-select';
import FlagUS from '/flags/us.png';
import FlagVN from '/flags/vn.png';

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const options = [
    { value: 'vi', label: 'Tiếng Việt', img: FlagVN },
    { value: 'en', label: 'English', img: FlagUS },
  ];

  const CustomOption = (props: any) => (
    <components.Option {...props}>
      <OptionLabel img={props.data.img} text={props.data.label} />
    </components.Option>
  );

  const CustomSingleValue = (props: any) => (
    <components.SingleValue {...props}>
      <OptionLabel img={props.data.img} text={props.data.label} />
    </components.SingleValue>
  );

  return (
    <Select
      options={options}
      defaultValue={options.find(o => o.value === i18n.language)}
      onChange={opt => changeLanguage(opt?.value || 'vi')}
      components={{ Option: CustomOption, SingleValue: CustomSingleValue }}
      styles={{
        control: (base, state) => ({
          ...base,
          borderRadius: theme.borderRadius.large,
          minHeight: 34,
          paddingLeft: 4,
          borderColor: state.isFocused
            ? theme.colors.primary
            : theme.colors.border,
          boxShadow: state.isFocused
            ? `0 0 0 1px ${theme.colors.primary}`
            : 'none',
          '&:hover': {
            borderColor: theme.colors.primary,
          },
        }),
        option: (base, state) => ({
          ...base,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          backgroundColor: state.isSelected
            ? theme.colors.backgroundFocus
            : state.isFocused
              ? theme.colors.backgroundHover
              : theme.colors.white,
          color: state.isSelected
            ? theme.colors.white
            : theme.colors.textPrimary,
          cursor: 'pointer',
        }),
      }}
    />
  );
}

function OptionLabel({ img, text }: { img: string; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <img src={img} alt='' width='20' height='14' />
      <span>{text}</span>
    </div>
  );
}
