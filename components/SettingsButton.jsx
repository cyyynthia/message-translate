/*
 * Copyright (c) 2020 Bowser65
 * Licensed under the Open Software License version 3.0
 * Original work under MIT; See LICENSE.
 */

const {
  React,
  getModule,
  getModuleByDisplayName,
  i18n: { Messages }
} = require("powercord/webpack");
const { Button } = require("powercord/components");
const Tooltip = getModuleByDisplayName("Tooltip", false);

const buttonClasses = getModule([ "button" ], false);
const buttonWrapperClasses = getModule([ "buttonWrapper", "pulseButton" ], false);
const buttonTextAreaClasses = getModule([ "button", "textArea" ], false);

class SettingsButton extends React.Component {
  render() {
    return (
      <Tooltip
        color="black"
        postion="top"
        text={Messages.MESSAGE_TRANSLATE_SETTINGS}
      >
        {({ onMouseLeave, onMouseEnter }) => (
          <Button
            className={`message-translate-settings-button${
              this.props.getSetting("translate_sent_messages") ? " active" : ""
            }`}
            look={Button.Looks.BLANK}
            size={Button.Sizes.ICON}
            onClick={() => this.props.onClick()}
            onContextMenu={(e) => this.props.onContextMenu(e)}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            <div
              className={`${buttonClasses.contents} ${buttonWrapperClasses.button} ${buttonTextAreaClasses.button}`}
            >
              <svg className={`${buttonWrapperClasses.icon}`}>
                <path
                  fill="currentColor"
                  d="M 19.794, 3.299 H 9.765 L 8.797, 0 h -6.598 C 0.99, 0, 0, 0.99, 0, 2.199 V 16.495 c 0, 1.21, 0.99, 2.199, 2.199, 2.199 H 9.897 l 1.1, 3.299 H 19.794 c 1.21, 0, 2.199 -0.99, 2.199 -2.199 V 5.498 C 21.993, 4.289, 21.003, 3.299, 19.794, 3.299 z M 5.68, 13.839 c -2.48, 0 -4.492 -2.018 -4.492 -4.492 s 2.018 -4.492, 4.492 -4.492 c 1.144, 0, 2.183, 0.407, 3.008, 1.171 l 0.071, 0.071 l -1.342, 1.298 l -0.066 -0.06 c -0.313 -0.297 -0.858 -0.643 -1.671 -0.643 c -1.441, 0 -2.612, 1.193 -2.612, 2.661 c 0, 1.468, 1.171, 2.661, 2.612, 2.661 c 1.507, 0, 2.161 -0.962, 2.337 -1.606 h -2.43 v -1.704 h 4.344 l 0.016, 0.077 c 0.044, 0.231, 0.06, 0.434, 0.06, 0.665 C 10.001, 12.036, 8.225, 13.839, 5.68, 13.839 z M 11.739, 9.979 h 4.393 c 0, 0 -0.374, 1.446 -1.715, 3.008 c -0.588 -0.676 -0.995 -1.336 -1.254 -1.864 h -1.089 L 11.739, 9.979 z M 13.625, 13.839 l -0.588, 0.583 l -0.72 -2.452 C 12.685, 12.63, 13.13, 13.262, 13.625, 13.839 z M 20.893, 19.794 c 0, 0.605 -0.495, 1.1 -1.1, 1.1 H 12.096 l 2.199 -2.199 l -0.896 -3.041 l 1.012 -1.012 l 2.953, 2.953 l 0.803 -0.803 l -2.975 -2.953 c 0.99 -1.138, 1.759 -2.474, 2.106 -3.854 h 1.397 V 8.841 H 14.697 v -1.144 h -1.144 v 1.144 H 11.398 l -1.309 -4.443 H 19.794 c 0.605, 0, 1.1, 0.495, 1.1, 1.1 V 19.794 z"
                ></path>
              </svg>
            </div>
          </Button>
        )}
      </Tooltip>
    );
  }
}

module.exports = SettingsButton;
