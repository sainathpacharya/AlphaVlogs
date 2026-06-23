const React = require('react');
const {View} = require('react-native');

const createIcon = name => {
  const Icon = props => React.createElement(View, {...props, testID: `icon-${name}`});
  Icon.displayName = name;
  return Icon;
};

const knownIcons = {
  User: createIcon('User'),
  Mail: createIcon('Mail'),
  Phone: createIcon('Phone'),
  MapPin: createIcon('MapPin'),
  Building2: createIcon('Building2'),
  Landmark: createIcon('Landmark'),
  Hash: createIcon('Hash'),
  Crown: createIcon('Crown'),
  Sparkles: createIcon('Sparkles'),
  Target: createIcon('Target'),
  Video: createIcon('Video'),
  Shield: createIcon('Shield'),
  ChevronRight: createIcon('ChevronRight'),
  LogOut: createIcon('LogOut'),
  Trash2: createIcon('Trash2'),
  Users: createIcon('Users'),
  Check: createIcon('Check'),
  XCircle: createIcon('XCircle'),
  ImagePlus: createIcon('ImagePlus'),
};

module.exports = new Proxy(knownIcons, {
  get: (target, prop) => {
    if (prop === '__esModule') {
      return true;
    }
    if (prop in target) {
      return target[prop];
    }
    if (typeof prop === 'string') {
      return createIcon(prop);
    }
    return target[prop];
  },
});
