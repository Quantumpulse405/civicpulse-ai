export const DISTRICTS = [
  "Chennai",
  "Coimbatore",
  "Madurai",
  "Salem",
  "Namakkal",
  "Erode",
  "Tiruchirappalli",
  "Tirunelveli",
  "Vellore",
  "Thanjavur",
];

export const SECTORS = [
  "Healthcare",
  "Education",
  "Transportation",
  "Water & Sanitation",
  "Roads",
  "Electricity",
  "Digital Connectivity",
  "Public Safety",
];

export const LANGUAGES: { code: "en" | "ta" | "hi"; label: string }[] = [
  { code: "en", label: "English" },
  { code: "ta", label: "தமிழ்" },
  { code: "hi", label: "हिंदी" },
];

export const SAMPLE_TEXT: Record<string, string> = {
  en: "Our village has no nearby hospital. The nearest hospital is more than 20 km away.",
  ta: "எங்கள் பகுதியில் நல்ல பேருந்து வசதி இல்லை. மாணவர்கள் கல்லூரிக்கு செல்ல மிகவும் சிரமப்படுகிறார்கள்.",
  hi: "हमारे क्षेत्र में पीने के पानी की समस्या है और गर्मियों में पानी की बहुत कमी होती है।",
};