const {
	Webpack: {
		FindModule,
		CommonModules: { React },
	},
	Tools: {
		ReactTools: { WrapBoundary },
	},
} = KLibrary;

const Tooltip = FindModule.byDisplayName("Tooltip");
const classes = FindModule.byProps("edited");

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
			tooltip = this.props.Translator.isoLangs[tooltipLanguage]
				.nativeName;
			if (
				this.props.Translator.isoLangs[tooltipLanguage].nativeName !=
				this.props.Translator.isoLangs[tooltipLanguage].name
			) {
				tooltip = `${this.props.Translator.isoLangs[tooltipLanguage].name} | ${this.props.Translator.isoLangs[tooltipLanguage].nativeName}`;
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

module.exports = WrapBoundary(Indicator);
