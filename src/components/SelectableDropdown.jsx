import React from 'react';
import PropTypes from 'prop-types';

import { Dropdown } from '@edx/paragon';

function SelectableDropdown({
  options,
  onChange,
  label,
}) {
  return (
    <Dropdown>
      <Dropdown.Toggle variant="link" size="sm">
        {label}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {
          options.map(option => (
            <Dropdown.Item
              type="button"
              key={option.value}
              onClick={
                () => {
                  if (onChange) {
                    onChange(option);
                  }
                }
              }
            >
              {option.label}
            </Dropdown.Item>
          ))
}
      </Dropdown.Menu>
    </Dropdown>
  );
}

SelectableDropdown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    }),
  ).isRequired,
  onChange: PropTypes.func,
  label: PropTypes.node,
};

SelectableDropdown.defaultProps = {
  onChange: null,
  label: null,
};

export default SelectableDropdown;
