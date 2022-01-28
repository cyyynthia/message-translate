/*
 * Copyright (c) 2020 Bowser65
 * Licensed under the Open Software License version 3.0
 * Original work under MIT; See LICENSE.
 */

const { getModule, FluxDispatcher } = require("powercord/webpack");

const { Engines } = require("../constants");
const translate = require("../node_modules/@k3rn31p4nic/google-translate-api");
const randomUseragent = require("../node_modules/random-useragent");

const { getMessage } = getModule([ "getMessages" ], false);

class Translator {
  constructor() {
    this.cache = {};
    this.rateLimitCache = {}
  }

  removeExceptions = (text) => {
    let exceptions = [];

    let counter = 0;

    let replaceMatches = (matches) => {
      if (!matches) return;
      for (let match of matches) {
        exceptions.push(match);
        text = text.replace(
          new RegExp(
            match.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"),
            "g"
          ),
          `[/////${counter}]`
        );
        counter++;
      }
    };

    // User and role tags.
    replaceMatches(text.match(/<@(!?|&?)\d+>/gi));
    // Channel tags.
    replaceMatches(text.match(/<#\d+>/gi));
    // Emojis.
    replaceMatches(text.match(/<(\w+)?:\w+:\d+>/gi));
    // Codeblocks.
    replaceMatches(text.match(/```(.+?|\n+)```/gis));
    // Code snippets.
    // Important to do this after codeblocks.
    replaceMatches(text.match(/`(.+?|\n+)`/gis));

    return { text, exceptions };
  };

  addExceptions = (text, exceptions) => {
    for (let i = 0; i < exceptions.length; i++) {
      let exception = exceptions[i];
      text = text.replace(
        new RegExp(
          `(\\[\\/\\/\\/\\/\\/${i}+\\]|\\[\\/\\/\\/\\/\\/ ${i}+\\])`,
          "gi"
        ),
        exception
      );
    }
    return text;
  };

  translate = async (text, language, engine, async = true) => {
    if (!Engines[engine]) return;
    if (!this.rateLimitCache[engine]) {
      this.rateLimitCache[engine] = {
        lastTime: 0,
        lastRatelimit: 0,
      };
    }

    const started = Date.now();

    const lastTime = this.rateLimitCache[engine].lastTime;
    this.rateLimitCache[engine].lastTime = started;

    const timeout =
      lastTime +
        Engines[engine].ratelimit +
        this.rateLimitCache[engine].lastRatelimit <
      started
        ? 0
        : Engines[engine].ratelimit +
          this.rateLimitCache[engine].lastRatelimit -
          (started - lastTime);

    this.rateLimitCache[engine].lastRatelimit = timeout;

    // const createWindow = () => {
    //   const window = new BrowserWindow({
    //     show: false,
    //     webPreferences: {
    //       nodeIntegration: true,
    //       nodeIntegrationInWorker: true,
    //     },
    //   });
    //   window.webContents.openDevTools();
    //   return window;
    // };

    const translateFunctions = {
      google: (text, language) => {
        return new Promise((resolve, reject) => {
          translate(text, {
            to: language,
            agents: randomUseragent.getAll(),
          })
            .then((res) => {
              resolve({
                text: res.text,
                originalLanguage: res.from.language.iso,
              });
            })
            .catch((err) => {
              reject(err);
            });
          // const window = createWindow();
          // window.webContents.on("did-finish-load", () => {
          //   ipc.on(
          //     "message-translate-translation",
          //     (event, message) => {
          //       try {
          //         window.close();
          //       } catch {}
          //       if (message) resolve(message);
          //       reject();
          //     }
          //   );
          //   window.webContents.executeJavaScript(`
          //     require("electron").ipcRenderer.sendTo(${
          //       remote.getCurrentWindow().webContents.id
          //     }, "message-translate-translation", (document.querySelector(".translation") || {}).innerText);
          //   `);
          // });
          // window.loadURL(
          //   `https://translate.google.com/#auto/${language}/${encodeURIComponent(
          //     text
          //   )}`
          // );
        });
      }
    };

    let translatePromise = (resolve, reject) => {
      setTimeout(async () => {
        const finished = Date.now();

        const excepted = this.removeExceptions(text);
        let translationResults;
        let tries = 0;

        while (!translationResults && tries < 3) {
          tries++;
          try {
            translationResults = await translateFunctions[engine](
              excepted.text,
              language
            );
          } catch (e) {}
        }

        if (!translationResults) reject();

        translationResults.text = this.addExceptions(
          translationResults.text,
          excepted.exceptions
        );

        resolve(translationResults);
      }, timeout);
    };

    if (async) {
      return await new Promise(translatePromise);
    }
    return new Promise(translatePromise);
  };

  translateMessage = async (message, language, engine, async = true) => {
    if (!message.content || message.content.length === 0) {
      return "";
    }
    // If any of the properties don't exist, make them.
    if (!this.cache[message.channel_id]) {
      this.cache[message.channel_id] = {};
    }
    let alreadyTranslated = true;
    if (!this.cache[message.channel_id][message.id]) {
      alreadyTranslated = false;
      this.cache[message.channel_id][message.id] = {
        channelID: message.channel_id,
        currentLanguage: "original",
        originalLanguage: null,
        engines: {},
        originalContent: message.content,
      };
    }
    if (!this.cache[message.channel_id][message.id].engines[engine]) {
      this.cache[message.channel_id][message.id].engines[engine] = {};
    }
    if (
      !this.cache[message.channel_id][message.id].engines[engine][
        language
      ]
    ) {
      this.cache[message.channel_id][message.id].engines[engine][
        language
      ] = {};
    }

    // If the target language is the original language, set it back.

    // If the target language is cached, use it.
    if (language == "original") {
      this.cache[message.channel_id][message.id].currentLanguage =
        "original";
      message.content = this.cache[message.channel_id][
        message.id
      ].originalContent;
    } else if (
      this.cache[message.channel_id][message.id].engines[engine][language]
        .content
    ) {
      this.cache[message.channel_id][
        message.id
      ].currentLanguage = language;
      message.content = this.cache[message.channel_id][
        message.id
      ].engines[engine][language].content;
    } else if (!alreadyTranslated) {
      const translatePromise = (resolve, reject) => {
        this.translate(message.content, language, engine, async)
          .then((results) => {
            message.content = results.text;
            if (
              this.cache[message.channel_id][message.id]
                .originalLanguage === null
            )
              this.cache[message.channel_id][
                message.id
              ].originalLanguage = results.originalLanguage;

            this.cache[message.channel_id][
              message.id
            ].currentLanguage = language;
            this.cache[message.channel_id][message.id].engines[
              engine
            ][language].content = results.text;

            this.updateMessage(message);

            resolve(message);
          })
          .catch((e) => {
            reject(e);
          });
      };

      if (async) {
        return await new Promise(translatePromise);
      }
      return new Promise(translatePromise);
    }

    if (async) {
      return await new Promise((resolve) => {
        this.updateMessage(message);
        resolve(message);
      });
    }
    return new Promise((resolve) => {
      this.updateMessage(message);
      resolve(message);
    });
  };

  updateMessage(message) {
    FluxDispatcher.dirtyDispatch({
      translation: true,
      type: "MESSAGE_UPDATE",
      message,
    });
  }

  clearCache = () => {
    for (let channelID in this.cache) {
      for (let messageID in this.cache[channelID]) {
        this.removeMessage(channelID, messageID);
      }
    }
    this.cache = {};
  };

  removeMessage = (channelID, messageID, reset = true) => {
    let message = getMessage(channelID, messageID);
    if (reset) {
      message.content = this.cache[channelID][messageID].originalContent;
      this.updateMessage(message);
    }
    delete this.cache[channelID][messageID];
  };
}

module.exports = Translator;
