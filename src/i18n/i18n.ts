import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en";
import vi from "./locales/vi";

const resources = {
  en: {
    translation: en,
  },
  vi: {
    translation: vi,
  },
};

const savedLanguage = localStorage.getItem("language") || "en";

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: "vi",

    keySeparator: ".",

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
