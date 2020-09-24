/*
 * Copyright (c) 2020 Bowser65
 * Licensed under the Open Software License version 3.0
 * Original work under MIT; See LICENSE.
 */

const { React, getModule, getModuleByDisplayName } = require('powercord/webpack')

const { IsoLangs } = require('../constants')

const Tooltip = getModuleByDisplayName('Tooltip', false)
const classes = getModule([ "edited" ], false);

class Indicator extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		const tooltipLanguage =
			this.props.currentLanguage === "original"
				? this.props.originalLanguage
				: this.props.currentLanguage;
		let tooltip = "Unknown";

		try {
			tooltip = IsoLangs[tooltipLanguage].nativeName;
			if (IsoLangs[tooltipLanguage].nativeName !== IsoLangs[tooltipLanguage].name) {
				tooltip = `${IsoLangs[tooltipLanguage].name} | ${IsoLangs[tooltipLanguage].nativeName}`;
			}
		} catch {}

		return (
			<Tooltip color="black" postion="top" text={tooltip}>
				{({ onMouseLeave, onMouseEnter }) => (
					<span
						className={`message-translate-indicator ${classes.edited}`}
						onMouseEnter={onMouseEnter}
						onMouseLeave={onMouseLeave}
					>
						{this.props.currentLanguage === "original"
							? "(original)"
							: "(translated)"}
					</span>
				)}
			</Tooltip>
		);
	}
}

module.exports = Indicator;
