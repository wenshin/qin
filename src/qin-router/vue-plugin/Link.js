/**
 * inspired by vue-router router-link
 */
const history = require('../history');
const Vue = require('vue').default;

const toTypes = [String, Object];
const eventTypes = [String, Array];

/**
 * vue 组件中的 class 属性会自动处理
 * @examples
 * ```
 * <history-link to="/path/to">my link</history-link>
 * <history-link to="{{ {path, pathname, search, query} }}" auto-active>my link</history-link>
 * ```
 * @type {Object}
 */
module.exports = {
  name: 'history-link',
  props: {
    to: {
      type: toTypes,
      required: true
    },
    tag: {
      type: String,
      default: 'a'
    },
    append: Boolean,
    replace: Boolean,
    active: {
      type: Boolean,
      default: false
    },
    // if autoActive is true will listen the bux/history
    // NEW_LOCATION event rerender the link.
    // it's useful for navigation bar.
    autoActive: {
      type: Boolean,
      default: false
    },
    // exact active means this.location.path === currentLocation.path
    exactActive: {
      type: Boolean,
      default: true
    },
    event: {
      type: eventTypes,
      default: 'click'
    }
  },

  data() {
    return {
      innerClasses: {}
    };
  },

  computed: {
    location() {
      let options;
      if (typeof this.to === 'string') {
        options = {path: this.to};
      } else {
        options = this.to;
      }
      return history.Location.create(options);
    }
  },

  methods: {
    handleNewLocation(ctx) {
      if (!this.autoActive) return;
      const isSame = isSameLocation(this.location, ctx.location, this.exactActive);
      if (isSame && this.innerClasses['history-link-active']) return;
      if (!isSame && !this.innerClasses['history-link-active']) return;

      const classes = {};
      Vue.util.extend(classes, this.innerClasses);
      Vue.util.extend(classes, {'history-link-active': isSame});
      this.innerClasses = classes;
    }
  },

  mounted() {
    if (!this.autoActive) return;
    const {NEW_LOCATION} = $app.events;
    $app.listen(NEW_LOCATION, this.handleNewLocation);
  },

  beforeDestory() {
    if (!this.autoActive) return;
    const {NEW_LOCATION} = $app.events;
    $app.unlisten(NEW_LOCATION, this.handleNewLocation);
  },

  render(h) {
    this.innerClasses['history-link'] = true;
    this.innerClasses['history-link-active'] = this.autoActive
      ? isSameLocation(this.location, $app.location, this.exactActive)
      : this.active;

    const handler = (e) => {
      if (guardEvent(e) && this.location.path !== $app.location.path) {
        if (this.replace) {
          $app.replace(this.location);
        } else {
          $app.push(this.location);
        }
      }
    };

    const on = {click: guardEvent};

    if (Array.isArray(this.event)) {
      this.event.forEach(e => (on[e] = handler));
    } else {
      on[this.event] = handler;
    }

    const data = {
      class: this.innerClasses
    };

    if (this.tag === 'a') {
      data.on = on;
      data.attrs = {href: this.location.path};
    } else {
      // find the first <a> child and apply listener and href
      const a = findAnchor(this.$slots.default);
      if (a) {
        // in case the <a> is a static node
        a.isStatic = false;
        const extend = Vue.util.extend;
        const aData = extend({}, a.data);
        a.data = aData;
        aData.on = on;
        const aAttrs = extend({}, a.data.attrs);
        a.data.attrs = aAttrs;
        aAttrs.href = this.location.path;
      } else {
        // doesn't have <a> child, apply listener to self
        data.on = on;
      }
    }

    return h(this.tag, data, this.$slots.default);
  }
};

function guardEvent(e) {
  // don't redirect with control keys
  if (e.metaKey || e.ctrlKey || e.shiftKey) return false;
  // don't redirect when preventDefault called
  if (e.defaultPrevented) return false;
  // don't redirect on right click
  if (e.button !== undefined && e.button !== 0) return false;
  // don't redirect if `target="_blank"`
  if (e.currentTarget && e.currentTarget.getAttribute) {
    const target = e.currentTarget.getAttribute('target');
    if (/\b_blank\b/i.test(target)) return false;
  }
  // this may be a Weex event which doesn't have this method
  if (e.preventDefault) {
    e.preventDefault();
  }
  return true;
}

function findAnchor(children) {
  if (children) {
    let child;
    for (let i = 0; i < children.length; i++) {
      child = children[i];
      if (child.tag === 'a') {
        return child;
      }
      if (child.children && (child = findAnchor(child.children))) {
        return child;
      }
    }
  }
  return null;
}

function isSameLocation(self, other, isMustExact) {
  if (!self || !other) return false;
  let isSame = false;
  if (other.path === self.path) {
    isSame = true;
  } else if (!isMustExact && self.isBasePathOf(other)) {
    isSame = true;
  }
  return isSame;
}
