import { URLstringify, range } from "./utils.js"
import InputForm from "./InputForm.jsx"
import InputField from "./InputField.jsx"

class RightPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            connected: false
        };
        for (var i = 1; i <= this.props.contest.numOfProbs; i++) {
            this.state["d" + i] = {
                disabled: false,
                disabledText: ""
            };
            this.state["v" + i] = {
                answer: "",
                user: "無"
            };
        }
        this.connect();
    }
    connect() {
        if (this.state.connected) return;
        try {
            this.ws = new WebSocket(`wss://${location.hostname}?` + URLstringify({
                auth: sessionStorage.getItem("auth"),
                name: sessionStorage.getItem("name"),
                contest: this.props.contest.name
            }));
            this.ws.onmessage = evt => {
                var data = JSON.parse(evt.data);

                console.log(`Recieved data`, data);
                switch (data.request) {
                    case "focus":
                        this.setState({
                            ["d" + data.no]: {
                                disabled: true,
                                disabledText: data.user + "作答中"
                            }
                        });
                        break;
                    case "blur":
                        this.setState({
                            ["d" + data.no]: {
                                disabled: false,
                                disabledText: ""
                            }
                        });
                        break;
                    case "submit":
                        this.setState({
                            ["v" + data.no]: data.answer
                        });
                        break;
                    case "answers":
                        var newState = {};
                        for (var i = 1; i <= this.props.contest.numOfProbs; i++) {
                            if (data.answers[i])
                                newState["v" + i] = JSON.parse(data.answers[i]);
                        }
                        this.setState(newState);
                        break;
                }
            }
            this.ws.onclose = e => {
                this.setState({
                    connected: false
                })
                setTimeout(() => this.connect(), 500);
            }
            this.ws.onopen = e => {
                console.log("startsetstate");
                this.setState({
                    connected: true
                }, e => console.log("Websocket connected", this.state.connected));
            }
        } catch (e) {
            console.log(e);
            setTimeout(() => this.connect(), 500);
        }
    }
    send(obj) {
        if (!this.state.connected) return this.connect();
        this.ws.send(JSON.stringify(obj));
    }
    render() {
        return (
            <div className="big medium right panel">
                <div className="dimmer" data-active={!this.state.connected}>連線中，請稍等</div>

                    <InputForm>{
                        range(1,this.props.contest.numOfProbs).map(
                            i => (<InputField key={i} no={i} send={o=>this.send(o)} {...this.state["v"+i]} {...this.state["d"+i]}/>)
                        )}
                    </InputForm>
            </div>
        )
    }
}

export default RightPanel
