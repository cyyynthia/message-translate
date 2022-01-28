module.exports = async function(message, userLang, langEngine, Translator, openSettings, failedTranslate){
  if (!langEngine || !userLang) {
    openSettings()
  } else {
    let targetLanguage = userLang;
    if (
      Translator.cache[message.channel_id] &&
      Translator.cache[message.channel_id][message.id] &&
      Translator.cache[message.channel_id][message.id].currentLanguage != "original"
    ) {
      targetLanguage = "original";
    }

    Translator.translateMessage(
      message,
      targetLanguage,
      langEngine
    ).catch(failedTranslate);
  }
}