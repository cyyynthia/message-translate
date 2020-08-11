const fs = require("fs");
const path = require("path");
const settingsPath = path.join(__dirname, "settings.json");

class SettingsHandler {
	constructor() {
		this.initSettings();
	}

	initSettings = () => {
		if (!fs.existsSync(settingsPath)) {
			fs.writeFileSync(settingsPath, JSON.stringify({}, null, "\t"));
		}
	};

	getSettings = () => {
		this.initSettings();
		return JSON.parse(fs.readFileSync(settingsPath));
	};

	getSetting = (settingName) => {
		let setting;
		try {
			setting = this.getSettings()[settingName];
		} catch {
			return null;
		}
		return setting;
	};

	setSettings = (settingData) => {
		this.initSettings();
		let settings;
		try {
			settings = this.getSettings();
		} catch {
			return;
		}
		for (let i = 0; i < Object.keys(settingData).length; i++) {
			let settingDataName = Object.keys(settingData)[i];
			let settingDataValue = settingData[settingDataName];
			console.log(settingDataName, settingDataValue);
			settings[settingDataName] = settingDataValue;
		}
		fs.writeFileSync(settingsPath, JSON.stringify(settings, null, "\t"));
	};
}

module.exports = SettingsHandler;
