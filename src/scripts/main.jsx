//import MathLive from "../../mathlive/src/mathlive.js"
import { URLstringify } from "./utils.js"
import Warning from "./Warning.jsx"
import Header from "./Header.jsx"
import LeftPanel from "./LeftPanel.jsx"
import RightPanel from "./RightPanel.jsx"


class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contest: {},
            users: {},
            status: "not fetched"
        }
        axios.post("/ajax", URLstringify({
            request: "get contest",
            name: location.search.slice(1),
            auth: sessionStorage.getItem("auth") || ""
        })).then(res => {
            if (res.data.error) {
                console.log(res.data.error);
                open("/#login", "_self");
            }
            delete res.data.request;
            if(res.data.status == "fetched")
                res.data.contest.contestLink = `https://docs.google.com/gview?url=${location.origin}${res.data.contest.contestLink}&embedded=true`
            this.setState({
                contest: res.data.contest,
                user: res.data.user,
                status: res.data.status
            });
        });
    }
    render() {
        var status = this.state.status;
        var header = time => (
            <Header
                started = {new Date() > new Date(this.state.contest.startTime)}
                ended = {status=="ended"}
                time = {time}
                user = {status != "not logged in" && this.state.user.name}
            >{this.state.contest.contestTitle}</Header>
        )
        switch (status) {
            case "fetched":
                return (
                    <div>
                        { header(new Date(this.state.contest.endTime)) }
                        <Warning className="small">您的螢幕過小，無法顯示作答區。請使用更大的螢幕。</Warning>
                        <Warning className="medium">
                            您的螢幕過小，無法顯示題目。請至<a href={this.state.contest.contestLink}>此連結</a>觀看題目，或使用更大的螢幕。
                        </Warning>
                        <LeftPanel src={this.state.contest.contestLink} />
                        <RightPanel contest={this.state.contest} user={this.state.user}/>
                    </div>
                )
            case "not yet":
                return (
                    <div>
                        { header(new Date(this.state.contest.startTime)) }
                        <div className="wide panel">
                            <h1 style={{fontSize:"64pt"}}>比賽尚未開始</h1>
                        </div>
                    </div>
                )
            case "ended":
                return (
                    <div>
                        { header(false) }
                        <LeftPanel className="wide" src={this.state.contest.contestLink} />
                    </div>
                )
            case "not logged in":
                return (
                    <div>
                        { header(new Date(this.state.contest.endTime)) }
                        <LeftPanel className="wide" src={this.state.contest.contestLink} />
                    </div>
                )
            default:
                return null;
        }
    }
}

ReactDOM.render(<Main />, document.getElementById("container"));
