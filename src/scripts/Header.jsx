class Header extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            time: new Date()
        }
        if(this.props.time && new Date() < this.props.time){
            setInterval(()=>{
                if(new Date() > this.props.time)
                    history.go(0);
                this.setState({
                    time: new Date()
                });
            })
        }
    }
    render() {
        var flr = Math.floor;
        var text = ""
        var ms = this.props.time - this.state.time;
        if(this.props.time){
            if (this.props.time.getDate() != this.state.time.getDate()) {
                text = `${Math.ceil(ms/(24*60*60*1000))}天`;
            } else {
                var s = flr(ms / 1000);
                var h = flr(s / 60 / 60);
                s -= h * 60 * 60;
                var m = flr(s / 60);
                s -= m * 60;
                text = `${h}:${(m<10?"0":"")+m}:${(s<10?"0":"")+s}`;
            }
        }
        return (
            <div className="header">
                <div style={{width:"100%", textAlign:"center"}}>
                    <h1>{this.props.children}</h1>
                </div>
                <span style={{right:"10px", bottom:0, position:"absolute"}}>
                    {this.props.user ?
                        <span>
                            您好，{this.props.user}的{sessionStorage.getItem("name")}&nbsp;&nbsp;
                            <a onClick={()=>{sessionStorage.removeItem("name");sessionStorage.removeItem("auth");open("/","_self")}}>登出</a>
                        </span>
                    :
                        <span>
                            您尚未登入&nbsp;&nbsp;
                            <a onClick={()=>{sessionStorage.clear();open("/#login","_self")}}>登入</a>
                        </span>
                    }
                </span>
                <span style={{left:"10px", bottom:0, position:"absolute"}}>
                    {this.props.ended?
                        "本競賽已結束"
                    :
                        <span>
                            {this.props.started?"剩餘時間：":"離開始時間:"}<span>{text}</span>
                        </span>
                    }
                </span>
            </div>
        )
    }
}

export default Header
