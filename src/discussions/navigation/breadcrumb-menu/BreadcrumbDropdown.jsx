import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Dropdown, DropdownButton } from '@edx/paragon';

import messages from './messages';

function BreadcrumbDropdown({
  currentItem,
  intl,
  showAllPath,
  items,
  itemPathFunc,
  itemLabelFunc,
  itemActiveFunc,
  itemFilterFunc,
}) {
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
        to={showAllPath}
      >
        {showAllMsg}
      </Dropdown.Item>
      {items && items?.map(item => (
        (itemFilterFunc === null || itemFilterFunc(item)) && (
        <Dropdown.Item
          key={itemLabelFunc(item)}
          active={itemActiveFunc(item)}
          as={Link}
          to={itemPathFunc(item)}
        >
          {itemLabelFunc(item)}
        </Dropdown.Item>
        )
      ))}
    </DropdownButton>
  );
}

BreadcrumbDropdown.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  currentItem: PropTypes.any,
  intl: intlShape.isRequired,
  showAllPath: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  items: PropTypes.array.isRequired,
  itemPathFunc: PropTypes.func.isRequired,
  itemLabelFunc: PropTypes.func.isRequired,
  itemActiveFunc: PropTypes.func.isRequired,
  itemFilterFunc: PropTypes.func,
};
BreadcrumbDropdown.defaultProps = {
  currentItem: null,
  itemFilterFunc: null,
};

export default injectIntl(BreadcrumbDropdown);
