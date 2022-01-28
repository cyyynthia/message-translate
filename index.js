/*
 * Copyright (c) 2020 Bowser65
 * Licensed under the Open Software License version 3.0
 * Original work under MIT; See LICENSE.
 */

const { Plugin } = require("powercord/entities");

const TranslateButton = require("./components/TranslateButton");
const Indicator = require("./components/Indicator");
const i18n = require("./i18n");

const { open: openModal } = require("powercord/modal");
const { findInReactTree } = require("powercord/util");
const { inject, uninject } = require("powercord/injector");

const SettingsModal = require("./components/SettingsModal");
const SettingsButton = require("./components/SettingsButton");
const QuickSettings = require("./components/QuickSettings");
const Translator = new (require("./TranslationHandler"))();
const translateAction = require("./TranslationHandler/translateAction");

const {
	React,
	FluxDispatcher,
	getModule,
	messages: MessageEvents,
	channels: { getChannelId },
	contextMenu: { openContextMenu },
	i18n: { Messages }
} = require("powercord/webpack");

const MiniPopover = getModule(
  (m) => m.default && m.default.displayName === "MiniPopover", false
);
const ChannelTextAreaButtons = getModule(
  (m) => m.type && m.type.displayName === "ChannelTextAreaButtons", false
);
const MessageContent = getModule(
  (m) => m.type && m.type.displayName === "MessageContent", false
);
const MessageContextMenu = getModule(
  (m) => m?.default?.displayName === "MessageContextMenu", false
);
const { MenuGroup, MenuItem } = getModule(["MenuGroup", "MenuGroup"], false);

module.exports = class MessageTranslate extends Plugin {
  constructor () {
    super()
    this.ConnectedSettingsButton = this.settings.connectStore(SettingsButton)
    this.ConnectedSettingsModal = this.settings.connectStore(SettingsModal)
    this.ConnectedTranslateButton = this.settings.connectStore(TranslateButton)
    this.ConnectedQuickSettings = this.settings.connectStore(QuickSettings)
  }

  async startPlugin() {
    this.loadStylesheet("style.scss");
    powercord.api.i18n.loadAllStrings(i18n);

    inject( // todo: use proper subscribe instead
      "message-translate-dispatcher",
      FluxDispatcher,
      "dispatch",
      (args) => {
        if (
          args[0].type == "MESSAGE_UPDATE" &&
          !args[0].translation &&
          Translator.cache[args[0].message.channel_id] &&
          Translator.cache[args[0].message.channel_id][args[0].message.id]
        ) {
          const currentLanguage = Translator.cache[args[0].message.channel_id][args[0].message.id].currentLanguage;
          Translator.removeMessage(
            args[0].message.channel_id,
            args[0].message.id,
            false
          );

          Translator.translateMessage(
            args[0].message,
            currentLanguage,
            this.settings.get("translation_engine")
          ).catch(this.failedTranslate);
        } else if (
          args[0].type == "MESSAGE_CREATE" &&
          args[0].message &&
          args[0].message.state !== "SENDING" &&
          args[0].message.channel_id == getChannelId() &&
          this.settings.get("translate_received_messages")
        ) {
          Translator.translateMessage(
            args[0].message,
            this.settings.get("target_language"),
            this.settings.get("translation_engine")
          ).catch(this.failedTranslate);
        }
        return args;
      }
    );

    inject(
      "message-translate-send-message",
      MessageEvents,
      "sendMessage",
      (args) => {
        if (this.settings.get("translate_sent_messages") && !args[1].translation) {
          // Make a copy of the original text.
          const originalContent = (args[1].content + " ").trim();

          Translator.translate(
            args[1].content,
            this.settings.get("target_language"),
            this.settings.get("translation_engine")
          )
            .then((message) => {
              args[1].content = message.text;
              args[1].translation = true;
              MessageEvents.sendMessage(...args);
            })
            .catch((e) => {
              // Send the original text if it couldn't be translated.
              console.error(e);
              powercord.api.notices.sendToast(
                this.generateToastID(),
                {
                  header: Messages.TRANSLATE,
                  content: Messages.FAILED_TRANSLATE,
                  buttons: [
                    {
                      text: "Send Original Text",
                      color: "green",
                      look: "outlined",
                      onClick: () => {
                        args[1].content = originalContent;
                        args[1].translation = true;
                        MessageEvents.sendMessage(
                          ...args
                        );
                      },
                    },
                    {
                      text: "Do Nothing",
                      color: "blue",
                      look: "ghost",
                    },
                  ],
                  icon: "exclamation-triangle",
                  timeout: 10e3,
                }
              );
            });

          return false;
        }

        return args;
      },
      true
    );

    inject(
      "message-translate-translate-button",
      MiniPopover,
      "default",
      (args, res) => {
        const props = findInReactTree(res, (r) => r && r.message);
        if (!props) return res;

        res.props.children.unshift(
          React.createElement(this.ConnectedTranslateButton, {
            openSettings: () => this.openSettings(),
            failedTranslate: () => this.failedTranslate(),
            message: props.message,
            Translator,
          })
        );
        return res;
      }
    );

    MiniPopover.default.displayName = "MiniPopover";

    inject(
      "message-translate-settings-button",
      ChannelTextAreaButtons,
      "type",
      (args, res) => {
        // Add to the buttons.
        res.props.children.unshift(
          React.createElement(this.ConnectedSettingsButton, {
            onClick: () => this.openSettings(),
            onContextMenu: (e) => openContextMenu(e, () =>
              React.createElement(this.ConnectedQuickSettings, {
                openSettings: () => this.openSettings()
              })
            )
          })
        );

        return res;
      }
    );

    ChannelTextAreaButtons.type.displayName = "ChannelTextAreaButtons";

    inject(
      "message-translate-message-content",
      MessageContent,
      "type",
      (args, res) => {
        try {
          res.props.children.push(
            React.createElement(Indicator, {
              originalLanguage: Translator.cache[args[0].message.channel_id][args[0].message.id].originalLanguage,
              currentLanguage: Translator.cache[args[0].message.channel_id][args[0].message.id].currentLanguage,
              targetLanguage: this.settings.get("target_language"),
            })
          );
        } catch {}

        return res;
      }
    );

    MessageContent.type.displayName = "MessageContent";

    inject(
      "message-translate-contextmenu",
      MessageContextMenu,
      "default",
      (args, res) => {
        if (!args[0]?.message || !res?.props?.children) return res;
        const message = args[0].message;
        let isTranslated = false;

        try {
          isTranslated = Translator.cache[message.channel_id][message.id].currentLanguage != "original"
        } catch {}

        res.props.children.splice(
          4,
          0,
          React.createElement(
            MenuGroup,
            null,
            React.createElement(MenuItem, {
              action: () => {
                translateAction(
                  message,
                  this.settings.get("user_language"),
                  this.settings.get("translation_engine"),
                  Translator,
                  this.openSettings,
                  this.failedTranslate
                )
              },
              disabled: !message.content,
              id: "translate-message",
              label:  (isTranslated) ?  Messages.SHOW_ORIGINAL_MESSAGE : Messages.TRANSLATE_MESSAGE
            })
          )
        );
        return res;
      }
    );

    MessageContextMenu.default.displayName = "MessageContextMenu";
  }

  pluginWillUnload() {
    uninject("message-translate-dispatcher");
    uninject("message-translate-send-message");
    uninject("message-translate-edit-message");
    uninject("message-translate-translate-button");
    uninject("message-translate-settings-button");
    uninject("message-translate-message-content");
    uninject("message-translate-contextmenu");
    Translator.clearCache();
  }

  generateToastID() {
    return (
      "message-translate-translating-" +
      Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, "")
        .substr(0, 5)
    );
  }

  failedTranslate(e) {
    console.error(e);
    powercord.api.notices.sendToast(
      this.generateToastID(),
      {
        header: Messages.TRANSLATE,
        content: Messages.FAILED_TRANSLATE,
        icon: "exclamation-triangle",
        timeout: 3e3,
      }
    );
  }

  openSettings() {
    openModal(() => React.createElement(this.ConnectedSettingsModal))
  }
};
