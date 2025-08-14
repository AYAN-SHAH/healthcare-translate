export const LANGUAGES = [
    { code: "en", label: "English" },
    { code: "es", label: "Spanish" },
    { code: "ur", label: "Urdu" },
    { code: "ar", label: "Arabic" },
    { code: "bn", label: "Bengali" },
    { code: "fr", label: "French" },
    { code: "de", label: "German" },
    { code: "hi", label: "Hindi" },
    { code: "tl", label: "Tagalog" },
    { code: "zh", label: "Chinese" },
  ];
  
  export const getLabel = (code: string) => LANGUAGES.find(l => l.code === code)?.label || code;