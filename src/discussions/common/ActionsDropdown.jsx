import React, {
  useCallback, useMemo, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import {
  Button, Dropdown, Icon, IconButton, ModalPopup, useToggle,
} from '@edx/paragon';
import { MoreHoriz } from '@edx/paragon/icons';

import { ContentActions } from '../../data/constants';
import { contentSelector } from '../data/constants';
import { selectBlackoutDate } from '../data/selectors';
import messages from '../messages';
import { inBlackoutDateRange, useActions } from '../utils';

function ActionsDropdown({
  actionHandlers,
  contentType,
  disabled,
  dropDownIconSize,
  iconSize,
  id,
  intl,
  postType,
}) {
  const buttonRef = useRef();
  const [isOpen, open, close] = useToggle(false);
  const [target, setTarget] = useState(null);
  const commentOrPost = useSelector(contentSelector[contentType](id));
  const blackoutDateRange = useSelector(selectBlackoutDate);
  const actions = useActions({ ...commentOrPost, postType });

  const handleActions = useCallback((action) => {
    const actionFunction = actionHandlers[action];
    if (actionFunction) {
      actionFunction();
    } else {
      logError(`Unknown or unimplemented action ${action}`);
    }
  }, [actionHandlers]);

  // Find and remove edit action if in blackout date range.
  useMemo(() => {
    if (inBlackoutDateRange(blackoutDateRange)) {
      actions.splice(actions.findIndex(action => action.id === 'edit'), 1);
    }
  }, [actions, blackoutDateRange]);

  const onClickButton = useCallback(() => {
    setTarget(buttonRef.current);
    open();
  }, [open]);

  const onCloseModal = useCallback(() => {
    close();
    setTarget(null);
  }, [close]);

  return (
    <>
      <IconButton
        onClick={onClickButton}
        alt={intl.formatMessage(messages.actionsAlt)}
        src={MoreHoriz}
        iconAs={Icon}
        disabled={disabled}
        size={iconSize}
        ref={buttonRef}
        iconClassNames={dropDownIconSize ? 'dropdown-icon-dimentions' : ''}
      />
      <div className="actions-dropdown">
        <ModalPopup
          onClose={onCloseModal}
          positionRef={target}
          isOpen={isOpen}
          placement="bottom-end"
        >
          <div
            className="bg-white shadow d-flex flex-column"
            data-testid="actions-dropdown-modal-popup"
          >
            {actions.map(action => (
              <React.Fragment key={action.id}>
                {(action.action === ContentActions.DELETE) && <Dropdown.Divider />}
                <Dropdown.Item
                  as={Button}
                  variant="tertiary"
                  size="inline"
                  onClick={() => {
                    close();
                    handleActions(action.action);
                  }}
                  className="d-flex justify-content-start actions-dropdown-item"
                >
                  <Icon
                    src={action.icon}
                    className="icon-size-24"
                  />
                  <span className="font-weight-normal font-xl ml-2">
                    {intl.formatMessage(action.label)}
                  </span>
                </Dropdown.Item>
              </React.Fragment>
            ))}
          </div>
        </ModalPopup>
      </div>
    </>
  );
}

ActionsDropdown.propTypes = {
  intl: intlShape.isRequired,
  id: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  actionHandlers: PropTypes.objectOf(PropTypes.func).isRequired,
  iconSize: PropTypes.string,
  dropDownIconSize: PropTypes.bool,
  contentType: PropTypes.oneOf(['POST', 'COMMENT']).isRequired,
  postType: PropTypes.oneOf(['discussion', 'question']).isRequired,
};

ActionsDropdown.defaultProps = {
  disabled: false,
  iconSize: 'sm',
  dropDownIconSize: false,
};

export default injectIntl(ActionsDropdown);
