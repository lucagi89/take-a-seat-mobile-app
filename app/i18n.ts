import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-react-native-language-detector";

// Import your translations
import en from "./locales/en/translation.json";
import it from "./locales/it/translation.json";

i18n
  .use(LanguageDetector) // Detects device language
  .use(initReactI18next) // Passes i18n to react-i18next
  .init({
    compatibilityJSON: "v3",
    fallbackLng: "en", // Fallback if detected language is not available
    resources: {
      en: { translation: en },
      it: { translation: it },
    },
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
  });

export default i18n;
