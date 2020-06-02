class LeftPanel extends React.Component {
    render() {
        return (
            <div className={`big small panel ${this.props.className}`}>
                <iframe id="pdfViewer" src={this.props.src}>
                您的瀏覽器不支援內嵌框架，請至<a href={this.props.src}>此連結</a>觀看題目。
                </iframe>
            </div>
        );
    }
}

export default LeftPanel
