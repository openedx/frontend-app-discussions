import React from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';

import { Form, Icon } from '@edx/paragon';
import { Check } from '@edx/paragon/icons';

const ActionItem = ({
  id, label, value, selected,
}) => (
  <label
    htmlFor={id}
    style={{ cursor: 'pointer' }}
    className="focus border-bottom-0 d-flex align-items-center w-100 py-2 m-0 font-weight-500 filter-menu"
    data-testid={value === selected ? 'selected' : null}
    aria-checked={value === selected}
    tabIndex={value === selected ? '0' : '-1'}
  >
    <Icon src={Check} className={classNames('text-success mr-2', { invisible: value !== selected })} />
    <Form.Radio id={id} className="sr-only sr-only-focusable" value={value} tabIndex="0">
      {label}
    </Form.Radio>
    <span aria-hidden className="text-truncate">
      {label}
    </span>
  </label>
);

ActionItem.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  selected: PropTypes.string.isRequired,
};

export default React.memo(ActionItem);
