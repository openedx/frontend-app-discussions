import { Dropdown } from '@edx/paragon';
import { Consumer } from '@edx/paragon/dist/Dropdown';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

function SelectableDropdown({
  options, defaultOption, onChange, label,
}) {
  const [selected, setSelected] = useState(options.find(option => (option.value === defaultOption)));
  return (
    <Dropdown>
      <Dropdown.Button>
        { label || selected.label }
      </Dropdown.Button>
      <Consumer>
        { ({ toggle }) => (
          <Dropdown.Menu>
            { options
              .map(option => (
                <Dropdown.Item
                  type="button"
                  key={option.value}
                  onClick={
                    () => {
                      setSelected(option);
                      toggle();
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
        ) }
      </Consumer>
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
