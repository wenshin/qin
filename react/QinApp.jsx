const React = require('react');

class QinApp extends React.Component {
  getChildContext() {
    return {$app: this.props.$app};
  }

  render() {
    return this.props.children;
  }
}

QinApp.childContextTypes = {
  $app: React.PropTypes.object
};
