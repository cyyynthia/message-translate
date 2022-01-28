/*
 * Copyright (c) 2020 Bowser65
 * Licensed under the Open Software License version 3.0
 * Original work under MIT; See LICENSE.
 */

const { React, i18n: { Messages } } = require("powercord/webpack");
const { Button } = require("powercord/components");
const { Modal } = require("powercord/components/modal");
const { FormTitle } = require("powercord/components");
const { close: closeModal } = require("powercord/modal");
const Settings = require("./Settings");

class SettingsModal extends React.Component {
  render() {
    return (
      <Modal className="powercord-text" size={Modal.Sizes.DYNAMIC}>
        <Modal.Header>
          <FormTitle tag="h4">{Messages.MESSAGE_TRANSLATE_SETTINGS}</FormTitle>
          <Modal.CloseButton onClick={closeModal} />
        </Modal.Header>
        <Modal.Content>
          <Settings {...this.props}/>
        </Modal.Content>
        <Modal.Footer>
          <Button onClick={closeModal}>
            {Messages.CLOSE_SETTINGS}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

module.exports = SettingsModal;
