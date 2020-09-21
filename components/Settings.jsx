/*
 * Copyright (c) 2020 Bowser65
 * Licensed under the Open Software License version 3.0
 * Original work under MIT; See LICENSE.
 */

const { React } = require('powercord/webpack')

const {
	settings: { SelectInput, SwitchItem },
} = require("powercord/components");

class Settings extends React.Component {
	render() {
		const engineOptions = Object.keys(this.props.Translator.engines).map(
			(engine) => {
				return {
					label: this.props.Translator.engines[engine].name,
					value: this.props.Translator.engines[
						engine
					].name.toLowerCase(),
				};
			}
		);
		let engineLanguages = [];

		if (this.props.getSetting('translation_engine')) {
			engineLanguages = this.props.Translator.engines[
				this.props.getSetting('translation_engine')
			].languages.map((language) => {
				if (this.props.Translator.isoLangs[language]) {
					let label = this.props.Translator.isoLangs[language]
						.nativeName;
					if (
						this.props.Translator.isoLangs[language].nativeName !=
						this.props.Translator.isoLangs[language].name
					) {
						label = `${this.props.Translator.isoLangs[language].name} | ${this.props.Translator.isoLangs[language].nativeName}`;
					}
					return {
						label,
						value: language,
					};
				}
				return {
					label: language,
					value: language,
				};
			});
		}
		return (
			<React.Fragment>
				<SwitchItem
					children={["Translate Sent Messages"]}
					note="Whether or not to translate messages you send."
					value={this.props.getSetting('translate_sent_messages')}
					onChange={() => this.props.toggleSetting("translate_sent_messages")}
				/>
				<SwitchItem
					children={["Translate Received Messages"]}
					note="Whether or not to translate messages you receive automagically. This only works in the current channel."
					value={this.props.getSetting('translate_received_messages')}
					onChange={() => this.props.toggleSetting("translate_received_messages")}
				/>
				<SelectInput
					children={["Translation Engine"]}
					note="The translation engine you want to use."
					searchable={true}
					value={this.props.getSetting('translation_engine')}
					options={engineOptions}
					onChange={e => this.props.updateSetting("translation_engine", e.value)}
				/>
				<SelectInput
					children={["Your Language"]}
					note="The language you speak. Incoming messages will be translated to this language."
					searchable={true}
					value={this.props.getSetting('user_language')}
					options={engineLanguages}
					onChange={e => this.props.updateSetting("user_language", e.value)}
				/>
				<SelectInput
					children={["Target Language"]}
					note="The language you wish you could speak. Outgoing messages will be translated to this language."
					searchable={true}
					value={this.props.getSetting('target_language')}
					options={engineLanguages}
					onChange={e => this.props.updateSetting("target_language", e.value)}
				/>
			</React.Fragment>
		);
	}
}

module.exports = Settings;
