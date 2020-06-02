class InputField extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.value,
            init: false
        };
        this.mathfieldElem = React.createRef();
    }

    componentDidUpdate() {
        if (decodeURIComponent(this.props.answer) != this.state.answer)
            this.setMfValue(decodeURIComponent(this.props.answer));
    }

    componentDidMount() {
        if (!this.state.init)
            this.setState({ init: true }, () => {
                this.setMfValue("");
            })
    }
    setState(...x){
        console.log(this.props.no, "setstate", ...x);
        super.setState(...x);
    }
    setMfValue(answer) {
        this.setState({ answer }, () => {
            this.mathfield = MathLive.makeMathField.call({}, this.mathfieldElem.current, {
                virtualKeyboardMode: 'onfocus',
                onFocus: () => {
                    this.props.send({ request: "focus", no: this.props.no });
                },
                onBlur: () => {
                    this.props.send({ request: "blur", no: this.props.no });

                    if (this.mathfield.$text() != this.state.value)
                        this.props.send({ request: "submit", answer: encodeURIComponent(this.mathfield.$text()), no: this.props.no });
                }
            });
        })
    }

    render() {
        return (
            <div className="fieldbox">
                <div className="field">
                    <div className="mono number block">
                        <h1>({this.props.no})</h1>
                    </div>
                    <div className="input block">
                        <div className="dimmer" data-active={this.props.disabled}>{this.props.disabledText}</div>
                        <div className="mathfield" ref={this.mathfieldElem} value={this.props.answer}>{this.state.answer}</div>
                    </div>
                </div>
                <span className="note">作答者：{this.props.user}</span>
            </div>
        )
    }
}

export default InputField
