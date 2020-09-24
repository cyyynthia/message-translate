/*
 * Copyright (c) 2020 Bowser65
 * Licensed under the Open Software License version 3.0
 * Original work under MIT; See LICENSE.
 */

const { React } = require('powercord/webpack')
const { settings: { SelectInput, SwitchItem } } = require("powercord/components");

const { Engines } = require('../constants')
const { languagesForEngine } = require('../utils')

class Settings extends React.Component {
	render() {
		const engineOptions = Object.keys(Engines).map(
			(engine) => {
				return {
					label: Engines[engine].name,
					value: Engines[engine].name.toLowerCase(),
				};
			}
		);
		let engineLanguages = [];

		if (this.props.getSetting('translation_engine')) {
			engineLanguages = languagesForEngine(this.props.getSetting('translation_engine'));
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
