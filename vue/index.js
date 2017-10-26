const Link = require('./Link');

module.exports = {
  install(Vue) {
    Vue.component(Link.name, Link);
  },
  Link
};
