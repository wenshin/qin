const React = require('react');

class Link extends React.PureComponent {
  static propTypes = {
    to: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.object
    ]).isRequired,
    active: React.PropTypes.bool,
    replace: React.PropTypes.bool,
    autoActive: React.PropTypes.bool,
    exactActive: React.PropTypes.bool,
    children: React.PropTypes.any
  }

  static defaultProps = {
    replace: false,
    active: false,
    autoActive: false,
    exactActive: true,
  }

  constructor(props) {
    super(props);
    this.state = {
      active: props.active
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({active: nextProps.active});
  }

  componentDidMount() {
    if (!this.props.autoActive) {
      $app.listen($app.events.NEW_LOCATION, this.handleNewLocation);
    }
  }

  componentWillUnmount() {
    if (!this.props.autoActive) {
      $app.unlisten($app.events.NEW_LOCATION, this.handleNewLocation);
    }
  }

  handleNewLocation = (ctx) => {
    if (ctx.isPending) return;
    const isSame = isSameLocatioin(this.props.to, ctx.location, this.props.exactActive);
    this.setState({active: isSame});
  }

  onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const {to, replace} = this.props;
    const method = replace ? 'replace' : 'push';
    if (typeof to === 'string') {
      $app[method]({path: to});
    } else {
      $app[method](to);
    }
  }

  render() {
    const {to, children} = this.props;
    const path = typeof to === 'string' ? to : to.path;
    return React.createElement('a', {href: path, onClick: this.onClick}, children);
  }
}

module.exports = Link;

function isSameLocatioin(to, location, isExactEqual) {
  let curLoc = to;
  if (typeof to === 'string') {
    curLoc = {path: to};
  }
  if (isExactEqual) {
    return curLoc.path === location.path;
  }
  return location.isBaseOf(curLoc);
}
