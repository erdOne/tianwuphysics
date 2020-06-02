class Warning extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            display: true
        }
    }
    render() {
        return (
            <div className={`${this.props.className} warning ${this.state.display?"":"hidden"}`}>
                <div>{this.props.children}</div>
                <i onClick={()=>this.setState({display:false})}>
                    <svg height="100%" viewBox="-20 -20 40 40">
                	<line x1="10" y1="-10" x2="-10" y2="10" style={{stroke:"black", strokeWidth:2}} />
                    <line x1="-10" y1="-10" x2="10" y2="10" style={{stroke:"black", strokeWidth:2}} />
                    </svg>
                </i>
            </div>
        )
    }
}

export default Warning
