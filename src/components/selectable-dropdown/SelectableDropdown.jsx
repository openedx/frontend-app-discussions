import { Dropdown } from '@edx/paragon';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

function SelectableDropdown({
  options, defaultOption, onChange, label,
}) {
  const [selected, setSelected] = useState(options.find(option => (option.value === defaultOption)));
  return (
    <Dropdown>
      <Dropdown.Toggle>
        { label || selected.label }
      </Dropdown.Toggle>
      <Dropdown.Menu>
        { options
          .map(option => (
            <Dropdown.Item
              type="button"
              key={option.value}
              onClick={
                    () => {
                      setSelected(option);
                      if (onChange) {
                        onChange(option);
                      }
                    }
                  }
            >
              { option.label }
            </Dropdown.Item>
          )) }
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
  defaultOption: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  label: PropTypes.node,
};

SelectableDropdown.defaultProps = {
  onChange: null,
  label: null,
};

export default SelectableDropdown;
