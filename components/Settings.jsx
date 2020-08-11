const {
	React,
} = require("powercord/webpack");
const {
	settings: { SelectInput, SwitchItem },
} = require("powercord/components");
const SettingsHandler = new (require("../SettingsHandler"))();

class Settings extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			settings: SettingsHandler.getSettings(),
		};
	}

	setSetting = (setting, value) => {
		let settings = Object.assign({}, this.state.settings);
		settings[setting] = value;
		console.log(settings);
		SettingsHandler.setSettings(settings);
		this.setState({
			settings,
		});
	};

	getSetting = (setting, defaultValue = "") => {
		const settings = SettingsHandler.getSettings();
		return settings[setting] ? settings[setting] : defaultValue;
	};

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

		if (this.state.settings.translation_engine) {
			engineLanguages = this.props.Translator.engines[
				this.state.settings.translation_engine
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
					value={this.state.settings.translate_sent_messages}
					onChange={(event) => {
						this.setSetting(
							"translate_sent_messages",
							event.target.checked
						);
					}}
				/>
				<SelectInput
					children={["Translation Engine"]}
					note="The translation engine you want to use."
					searchable={true}
					value={this.state.settings.translation_engine}
					options={engineOptions}
					onChange={(event) => {
						this.setSetting("translation_engine", event.value);
					}}
				/>
				<SelectInput
					children={["Your Language"]}
					note="The language you speak. Incoming messages will be translated to this language."
					searchable={true}
					value={this.state.settings.user_language}
					options={engineLanguages}
					onChange={(event) => {
						this.setSetting("user_language", event.value);
					}}
				/>
				<SelectInput
					children={["Target Language"]}
					note="The language you wish you could speak. Outgoing messages will be translated to this language."
					searchable={true}
					value={this.state.settings.target_language}
					options={engineLanguages}
					onChange={(event) => {
						this.setSetting("target_language", event.value);
					}}
				/>
			</React.Fragment>
		);
	}
}

module.exports = Settings;
