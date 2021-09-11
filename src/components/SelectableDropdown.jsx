import React from 'react';
import PropTypes from 'prop-types';

import { MenuItem, SelectMenu } from '@edx/paragon';

function SelectableDropdown({
  options,
  onChange,
  label,
}) {
  return (
    <SelectMenu defaultMessage={label}>
      {
        options.map(option => (
          <MenuItem key={option.value} onClick={() => onChange(option)}>
            {option.label}
          </MenuItem>
        ))
      }
    </SelectMenu>
  );
}

SelectableDropdown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    }),
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.node,
};

SelectableDropdown.defaultProps = {
  label: null,
};

export default SelectableDropdown;
