const { React } = require("powercord/webpack");
const { Button } = require("powercord/components");
const { Modal } = require("powercord/components/modal");
const { FormTitle } = require("powercord/components");
const { close: closeModal } = require("powercord/modal");
const Settings = require("./Settings");

class SettingsModal extends React.Component {
	render() {
		return (
			<Modal className="powercord-text" size={Modal.Sizes.LARGE}>
				<Modal.Header>
					<FormTitle tag="h3">Message Translate Settings</FormTitle>
					<Modal.CloseButton onClick={closeModal} />
				</Modal.Header>
				<Modal.Content>
					<Settings Translator={this.props.Translator} />
				</Modal.Content>
				<Modal.Footer>
					<Button
						onClick={() => {
							closeModal();
						}}
					>
						Close Settings
					</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}

module.exports = SettingsModal;
