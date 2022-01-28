/*
 * Copyright (c) 2020 Bowser65
 * Licensed under the Open Software License version 3.0
 * Original work under MIT; See LICENSE.
 */

const { React, getModule, getModuleByDisplayName, i18n: { Messages } } = require("powercord/webpack")

const { IsoLangs } = require("../constants")

const Tooltip = getModuleByDisplayName("Tooltip", false)
const classes = getModule([ "edited" ], false);

class Indicator extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const langFrom = this.props.targetLanguage;
    const langTo = this.props.currentLanguage;
    let tooltip = "Unknown";

    try {
      // tooltip = `
      //   From: ${IsoLangs[langFrom].name} | ${IsoLangs[langFrom].nativeName}
      //   To: ${IsoLangs[langTo].name} | ${IsoLangs[langTo].nativeName}
      // `;
      tooltip = `From: ${IsoLangs[langFrom].name} | To: ${IsoLangs[langTo].name}`;
    } catch {}

    return (
      <Tooltip color="black" postion="top" text={tooltip}>
        {({ onMouseLeave, onMouseEnter }) => (
          <span
            className={`message-translate-indicator ${classes.edited}`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            {(this.props.currentLanguage === "original") ? "": `(${Messages.TRANSLATED})`}
          </span>
        )}
      </Tooltip>
    );
  }
}

module.exports = Indicator;
