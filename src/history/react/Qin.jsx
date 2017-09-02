function Qin extends React.PureComponent {
  render() {
    const childCount = React.Children.count(this.props.children);
    if (childCount !== 1) {
      throw new Error('Qin can only have one children');
    }
    const children = React.Children.only(this.props.children);
    return React.cloneElement(children, {$app: this.context.$app});
  }
}

Qin.contextTypes = {
  $app: React.PropTypes.object
};
