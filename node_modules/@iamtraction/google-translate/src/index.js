const { get, post } = requiire("powercord/http");
const languages = require("./languages");
const tokenGenerator = require("./tokenGenerator");

/**
 * @function translate
 * @param {String} text The text to be translated.
 * @param {Object} options The options object for the translator.
 * @returns {Object} The result containing the translation.
 */
async function translate(text, options) {
  if (typeof options !== "object") options = {};
  text = String(text);

  // Check if a lanugage is in supported; if not, throw an error object.
  for (const lang of [ options.from, options.to ]) {
    if (lang && !languages.isSupported(lang)) {
      const error = new Error();
      error.code = 400;
      error.message = `The language '${lang}' is not supported.`;
      throw error;
    }
  };

  // If options object doesn"t have "from" language, set it to "auto".
  if (!Object.prototype.hasOwnProperty.call(options, "from")) options.from = "auto";
  // If options object doesn"t have "to" language, set it to "en".
  if (!Object.prototype.hasOwnProperty.call(options, "to")) options.to = "en";
  // If options object has a "raw" property evaluating to true, set it to true.
  options.raw = Boolean(options.raw);

  // Get ISO 639-1 codes for the languages.
  options.from = languages.getISOCode(options.from);
  options.to = languages.getISOCode(options.to);

  // Generate Google Translate token for the text to be translated.
  const token = await tokenGenerator.generate(text);

  // URL & query string required by Google Translate.
  const baseUrl = "https://translate.google.com/translate_a/single";
  const data = {
    client: "gtx",
    sl: options.from,
    tl: options.to,
    hl: options.to,
    dt: [ "at", "bd", "ex", "ld", "md", "qca", "rw", "rm", "ss", "t" ],
    ie: "UTF-8",
    oe: "UTF-8",
    otf: 1,
    ssel: 0,
    tsel: 0,
    kc: 7,
    q: text,
    [token.name]: token.value
  };

  // Append query string to the request URL.
  let url = `${baseUrl}?${new URLSearchParams(data).toString()}`;
  let req;
  // If request URL is greater than 2048 characters, use POST method.
  if (url.length > 2048) {
    delete data.q;
    url = `${baseUrl}?${new URLSearchParams(data).toString()}`;
    req = post(url)
            .set("Content-Type", "application/x-www-form-urlencoded")
            .send({ q: text });
  } else {
    req = get(url);
  }

  // Request translation from Google Translate.
  const response = await req.execute();

  let result = {
    text: "",
    from: {
      language: {
        didYouMean: false,
        iso: ""
      },
      text: {
        autoCorrected: false,
        value: "",
        didYouMean: false
      }
    },
    raw: ""
  };

  // If user requested a raw output, add the raw response to the result
  if (options.raw) {
    result.raw = response.body;
  }

  // Parse string body to JSON and add it to result object.

  let body = JSON.parse(response.body);
  for (const obj of body[0]) {
    if (obj[0]) {
      result.text += obj[0];
    }
  };

  if (body[2] === body[8][0][0]) {
    result.from.language.iso = body[2];
  } else {
    result.from.language.didYouMean = true;
    result.from.language.iso = body[8][0][0];
  }

  if (body[7] && body[7][0]) {
    result.from.text.value = body[7][0]
                               .replace(/<b><i>/g, "[")
                               .replace(/<\/i><\/b>/g, "]");

    if (body[7][5] === true) {
      result.from.text.autoCorrected = true;
    } else {
      result.from.text.didYouMean = true;
    }
  }

  return result;
}

module.exports = translate;
module.exports.languages = languages;
