/*
 * Copyright (c) 2020 Bowser65
 * Licensed under the Open Software License version 3.0
 * Original work under MIT; See LICENSE.
 */

const { React, i18n: { Messages } } = require('powercord/webpack')
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
					children={[Messages.TRANSLATE_SENT_MESSAGES]}
					note={Messages.TRANSLATE_SENT_MESSAGES_NOTE}
					value={this.props.getSetting('translate_sent_messages')}
					onChange={() => this.props.toggleSetting("translate_sent_messages")}
				/>
				<SwitchItem
					children={[Messages.TRANSLATE_RECEIVED_MESSAGES]}
					note={Messages.TRANSLATE_RECEIVED_MESSAGES_NOTE}
					value={this.props.getSetting('translate_received_messages')}
					onChange={() => this.props.toggleSetting("translate_received_messages")}
				/>
				<SelectInput
					children={[Messages.TRANSLATION_ENGINE]}
					note={Messages.TRANSLATION_ENGINE_NOTE}
					searchable={true}
					value={this.props.getSetting('translation_engine')}
					options={engineOptions}
					onChange={e => this.props.updateSetting("translation_engine", e.value)}
				/>
				<SelectInput
					children={[Messages.YOUR_LANGUAGE]}
					note={Messages.YOUR_LANGUAGE_NOTE}
					searchable={true}
					value={this.props.getSetting('user_language')}
					options={engineLanguages}
					onChange={e => this.props.updateSetting("user_language", e.value)}
				/>
				<SelectInput
					children={[Messages.TARGET_LANGUAGE]}
					note={Messages.TARGET_LANGUAGE_NOTE}
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
