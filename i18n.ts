import * as Localization from "expo-localization";
import { I18n } from "i18n-js";

// Importar traducciones
import en from "./locales/en.json";
import es from "./locales/es.json";

// Crear instancia de I18n
const i18n = new I18n({
  en,
  es,
});

i18n.enableFallback = true;

// Obtener idioma del sistema operativo
i18n.locale = Localization.getLocales()[0]?.languageCode || "en";

export default i18n;
