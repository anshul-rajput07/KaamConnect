
const API_URL = "https://api.mymemory.translated.net/get";

function containsHindi(text) {
  return /[\u0900-\u097F]/.test(text);
}

export async function translateMessageToEnglish(message) {
  const originalText = message.trim();

  if (!originalText) {
    return {
      success: false,
      translatedText: "",
      needsAI: false,
      reason: "EMPTY_MESSAGE",
    };
  }

  // English messages don't need translation.
  if (!containsHindi(originalText)) {
    return {
      success: true,
      translatedText: originalText,
      needsAI: false,
      reason: "TRANSLATION_NOT_NEEDED",
    };
  }

  try {
    const query = encodeURIComponent(originalText);

    const response = await fetch(
      `${API_URL}?q=${query}&langpair=hi|en`
    );

    if (!response.ok) {
      throw new Error("Translation service unavailable");
    }

    const data = await response.json();
    const translatedText =
      data?.responseData?.translatedText?.trim();

    if (
      !translatedText ||
      data?.responseStatus !== 200
    ) {
      throw new Error("Translation unsuccessful");
    }

    return {
      success: true,
      translatedText,
      needsAI: false,
      reason: "TRANSLATED_SUCCESSFULLY",
    };
  } catch (error) {
    console.log("Translation error:", error.message);

    return {
      success: false,
      translatedText: originalText,
      needsAI: true,
      reason: "TRANSLATION_FAILED",
    };
  }
}
