const React = require('react');

class QinApp extends React.PureComponent {
  getChildContext() {
    return {$app: this.props.app};
  }

  render() {
    const childCount = React.Children.count(this.props.children);
    if (childCount !== 1) {
      throw new Error('QinApp can only have one children');
    }
    return React.Children.only(this.props.children);
  }
}

QinApp.childContextTypes = {
  $app: React.PropTypes.object
};
