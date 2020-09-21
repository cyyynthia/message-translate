const { Plugin } = require("powercord/entities");
const {
	Webpack: {
		FindModule,
		CommonModules: { React, FluxDispatcher },
	},
	Tools: { ReactTools },
} = KLibrary;
const Settings = new KLibrary.Settings("message-translate");

const MiniPopover = FindModule.byFilter(
	(m) => m.default.displayName === "MiniPopover"
);
const TranslateButton = require("./components/TranslateButton");
const Indicator = require("./components/Indicator");
const ChannelTextAreaContainer = FindModule.byFilter(
	(m) => m.type.render.displayName === "ChannelTextAreaContainer"
);
const MessageContent = FindModule.byFilter(
	(m) => m.type.displayName === "MessageContent"
);

const { findInReactTree } = require("powercord/util");
const { inject, uninject } = require("powercord/injector");

const SettingsButton = require("./components/SettingsButton");
const Translator = new (require("./TranslationHandler"))();

const MessageEvents = FindModule.byProps("sendMessage", "editMessage");
const { getChannelId } = FindModule.byProps("getChannelId");

module.exports = class MessageTranslate extends Plugin {
	async startPlugin() {
		this.loadStylesheet("style.scss");

		inject(
			"message-translate-dispatcher",
			FluxDispatcher,
			"dispatch",
			(args) => {
				if (
					args[0].type == "MESSAGE_UPDATE" &&
					!args[0].translation &&
					Translator.cache[args[0].message.channel_id] &&
					Translator.cache[args[0].message.channel_id][
						args[0].message.id
					]
				) {
					const currentLanguage =
						Translator.cache[args[0].message.channel_id][
							args[0].message.id
						].currentLanguage;
					Translator.removeMessage(
						args[0].message.channel_id,
						args[0].message.id,
						false
					);
					const settings = Settings.getSettings();
					Translator.translateMessage(
						args[0].message,
						currentLanguage,
						settings.translation_engine
					).catch((e) => {
						console.error(e);
						powercord.api.notices.sendToast(
							this.generateToastID(),
							{
								header: "Translate",
								content: "Failed to translate the message.",
								icon: "exclamation-triangle",
								timeout: 3e3,
							}
						);
					});
				} else if (
					args[0].type == "MESSAGE_CREATE" &&
					args[0].message &&
					args[0].message.state !== "SENDING" &&
					args[0].message.channel_id == getChannelId() &&
					Settings.getSetting("translate_received_messages")
				) {
					const settings = Settings.getSettings();
					Translator.translateMessage(
						args[0].message,
						settings.target_language,
						settings.translation_engine
					).catch((e) => {
						console.error(e);
						powercord.api.notices.sendToast(
							this.generateToastID(),
							{
								header: "Translate",
								content: "Failed to translate the message.",
								icon: "exclamation-triangle",
								timeout: 3e3,
							}
						);
					});
				}
				return args;
			}
		);

		inject(
			"message-translate-send-message",
			MessageEvents,
			"sendMessage",
			(args) => {
				const settings = Settings.getSettings();

				if (settings.translate_sent_messages && !args[1].translation) {
					// Make a copy of the original text.
					const originalContent = (args[1].content + " ").trim();

					Translator.translate(
						args[1].content,
						settings.target_language,
						settings.translation_engine
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
									header: "Translate",
									content:
										"Failed to translate your message.",
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
			"message-translate-settings-button",
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

		inject(
			"message-translate-message-content",
			MessageContent,
			"type",
			(args, res) => {
				const settings = Settings.getSettings();

				try {
					res.props.children.push(
						React.createElement(Indicator, {
							Translator,
							originalLanguage:
								Translator.cache[args[0].message.channel_id][
									args[0].message.id
								].originalLanguage,
							currentLanguage:
								Translator.cache[args[0].message.channel_id][
									args[0].message.id
								].currentLanguage,
							targetLanguage: settings.target_language,
						})
					);
				} catch {}

				return res;
			}
		);

		MessageContent.type.displayName = "MessageContent";

		ReactTools.rerenderAllMessages();
	}

	pluginWillUnload() {
		uninject("message-translate-dispatcher");
		uninject("message-translate-send-message");
		uninject("message-translate-edit-message");
		uninject("message-translate-translate-button");
		uninject("message-translate-settings-button");
		uninject("message-translate-message-content");
		Translator.clearCache();
		ReactTools.rerenderAllMessages();
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
};
