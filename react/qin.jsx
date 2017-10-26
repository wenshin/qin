const React = require('react');

function qin(Component) {
  class QinComponent extends React.Component {
    render() {
      return <Component {...this.props} $app={this.context.$app} />
    }
  }
  QinComponent.contextTypes = {
    $app: React.PropTypes.object
  };
  return QinComponent;
}

module.exports = qin;
