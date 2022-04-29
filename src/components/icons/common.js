/* eslint-disable no-underscore-dangle */
/* eslint-disable no-func-assign */
/* eslint-disable prefer-object-spread */
/* eslint-disable prefer-rest-params */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
// eslint-disable-next-line import/prefer-default-export
export function _extends() {
  _extends = Object.assign || function (target) {
    for (let i = 1; i < arguments.length; i++) {
      const source = arguments[i];
      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
