class InputForm extends React.Component {
    render() {
        return (<form style={{overflow:"scroll", height:"100%", marginLeft:"20px"}}>
            <div className="fields" style={{paddingBottom:"50%"}}>
                {this.props.children}
            </div>
        </form>)
    }
}

export default InputForm
