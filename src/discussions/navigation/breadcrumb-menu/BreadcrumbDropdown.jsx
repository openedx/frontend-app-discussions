import React from 'react';
import PropTypes from 'prop-types';

import { Dropdown, DropdownButton } from '@openedx/paragon';
import { Link } from 'react-router-dom';

import { useIntl } from '@openedx/frontend-base';

import messages from './messages';

const BreadcrumbDropdown = ({
  currentItem = null,
  showAllPath,
  items,
  itemPathFunc,
  itemLabelFunc,
  itemActiveFunc,
  itemFilterFunc = null,
}) => {
  const intl = useIntl();
  const showAllMsg = intl.formatMessage(messages.showAll);

  return (
    <DropdownButton
      title={itemLabelFunc(currentItem) || showAllMsg}
      variant="outline"
    >
      <Dropdown.Item
        key="null"
        active={!currentItem}
        as={Link}
        to={showAllPath()}
      >
        {showAllMsg}
      </Dropdown.Item>
      {items && items?.map(item => (
        (itemFilterFunc === null || itemFilterFunc(item)) && (
          <Dropdown.Item
            key={itemLabelFunc(item)}
            active={itemActiveFunc(item)}
            as={Link}
            to={itemPathFunc(item)()}
          >
            {itemLabelFunc(item)}
          </Dropdown.Item>
        )
      ))}
    </DropdownButton>
  );
};

BreadcrumbDropdown.propTypes = {
  currentItem: PropTypes.shape({
    name: PropTypes.string,
    id: PropTypes.string,
    questions: PropTypes.number,
    discussions: PropTypes.number,
    flags: PropTypes.number,
  }),
  showAllPath: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    id: PropTypes.string,
    questions: PropTypes.number,
    discussions: PropTypes.number,
    flags: PropTypes.number,
  })).isRequired,
  itemPathFunc: PropTypes.func.isRequired,
  itemLabelFunc: PropTypes.func.isRequired,
  itemActiveFunc: PropTypes.func.isRequired,
  itemFilterFunc: PropTypes.func,
};

export default React.memo(BreadcrumbDropdown);
