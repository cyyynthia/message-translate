const { Plugin } = require("powercord/entities");
const { React, getModule } = require("powercord/webpack");
const MiniPopover = getModule(
	(m) => m.default && m.default.displayName === "MiniPopover",
	false
);
const TranslateButton = require("./components/TranslateButton")(MiniPopover);
const ChannelTextAreaContainer = getModule(
	(m) =>
		m.type &&
		m.type.render &&
		m.type.render.displayName === "ChannelTextAreaContainer",
	false
);
const { findInReactTree } = require("powercord/util");
const { inject, uninject } = require("powercord/injector");
const SettingsButton = require("./components/SettingsButton");
const { getMessage } = getModule(["getMessages"], false);
const { getChannel } = getModule(["getChannel"], false);
const SettingsHandler = new (require("./SettingsHandler"))();
const Translator = new (require("./TranslationHandler"))();
const MessageEvents = getModule(["sendMessage", "editMessage"], false);
const dispatcher = getModule(["dirtyDispatch"], false);

module.exports = class MessageTranslate extends Plugin {
	async startPlugin() {
		this.loadStylesheet("style.scss");

		inject("pc-translate-dispatcher", dispatcher, "dispatch", (args) => {
			if (args[0].type == "MESSAGE_UPDATE" && !args[0].translation && Translator.cache[args[0].message.channel_id] && Translator.cache[args[0].message.channel_id][args[0].message.id]) {
				const currentLanguage = Translator.cache[args[0].message.channel_id][args[0].message.id].currentLanguage;
				Translator.removeMessage(args[0].message.channel_id, args[0].message.id, false);
				const settings = SettingsHandler.getSettings();
				Translator.translateMessage(args[0].message, currentLanguage, settings.translation_engine).then((message) => {
					Translator.updateMessage(message);
				});
			}
			return args;
		});

		inject(
			"pc-translate-send-message",
			MessageEvents,
			"sendMessage",
			(args) => {
				const settings = SettingsHandler.getSettings();

				if (settings.translate_sent_messages && !args[1].translation) {
					// Make a copy of the original text.
					const originalContent = (args[1].content + " ").trim();

					const translatingID = this.generateToastID();
					powercord.api.notices.sendToast(translatingID, {
						header: "Translate",
						content: "Translating message...",
						icon: 'wrench',
						timeout: 3e3
					});

					Translator.translate(args[1].content, settings.target_language, settings.translation_engine).then((message) => {
						powercord.api.notices.closeToast(translatingID);

						args[1].content = message;
						args[1].translation = true;
						MessageEvents.sendMessage(...args);
					}).catch(() => {
						// Send the original text if it couldn't be translated.
						powercord.api.notices.closeToast(translatingID);

						powercord.api.notices.sendToast(this.generateToastID(), {
							header: "Translate",
							content: "Failed to translate your message.",
							buttons: [{
								text: "Send Original Text",
								color: 'green',
								look: 'outlined',
								onClick: () => {
									args[1].content = originalContent;
									args[1].translation = true;
									MessageEvents.sendMessage(...args);
								}
							}, {
								text: "Do Nothing",
								color: 'blue',
								look: 'ghost'
							}],
							icon: 'wrench',
							timeout: 10e3
						});
					});
					
					return false;
				}

				return args;
			},
			true
		);
		inject(
			"pc-translate-edit-message",
			MessageEvents,
			"editMessage",
			function (args) {
				let text = args[2].content.trim();

				args[2].content = text;

				return args;
			},
			true
		);

		inject(
			"pc-translate-translate-button",
			MiniPopover,
			"default",
			(args, res) => {
				const props = findInReactTree(res, (r) => r && r.message);
				if (!props) return res;
				res.props.children.unshift(
					React.createElement(TranslateButton, {
						message: props.message,
						Translator,
					})
				);
				return res;
			}
		);

		MiniPopover.default.displayName = "MiniPopover";

		inject(
			"pc-translate-settings-button",
			ChannelTextAreaContainer.type,
			"render",
			(args, res) => {
				// Add to the buttons.
				const props = findInReactTree(
					res,
					(r) =>
						r && r.className && r.className.indexOf("buttons-") == 0
				);
				props.children.unshift(
					React.createElement(SettingsButton, { Translator })
				);

				return res;
			}
		);

		ChannelTextAreaContainer.type.render.displayName =
			"ChannelTextAreaContainer";
	}

	pluginWillUnload() {
		uninject("pc-translate-dispatcher");
		uninject("pc-translate-send-message");
		uninject("pc-translate-edit-message");
		uninject("pc-translate-translate-button");
		uninject("pc-translate-settings-button");
		Translator.clearCache();
	}

	generateToastID() {
		return "pc-translate-translating-" + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
	}
};
