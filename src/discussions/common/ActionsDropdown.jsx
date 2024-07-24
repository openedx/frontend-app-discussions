import React, {
  useCallback, useMemo, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';

import {
  Button, Dropdown, Icon, IconButton, ModalPopup, useToggle,
} from '@openedx/paragon';
import { MoreHoriz } from '@openedx/paragon/icons';
import { useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';

import { ContentActions } from '../../data/constants';
import { selectIsPostingEnabled } from '../data/selectors';
import messages from '../messages';
import { useActions } from '../utils';

const ActionsDropdown = ({
  actionHandlers,
  contentType,
  disabled,
  dropDownIconSize,
  iconSize,
  id,
}) => {
  const buttonRef = useRef();
  const intl = useIntl();
  const [isOpen, open, close] = useToggle(false);
  const [target, setTarget] = useState(null);
  const isPostingEnabled = useSelector(selectIsPostingEnabled);
  const actions = useActions(contentType, id);

  const handleActions = useCallback((action) => {
    const actionFunction = actionHandlers[action];
    if (actionFunction) {
      actionFunction();
    } else {
      logError(`Unknown or unimplemented action ${action}`);
    }
  }, [actionHandlers]);

  // Find and remove edit action if in Posting is disabled.
  useMemo(() => {
    if (!isPostingEnabled) {
      actions.splice(actions.findIndex(action => action.id === 'edit'), 1);
    }
  }, [actions, isPostingEnabled]);

  const onClickButton = useCallback((event) => {
    event.preventDefault();
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
        iconClassNames={dropDownIconSize ? 'dropdown-icon-dimensions' : ''}
      />
      <div className="actions-dropdown">
        <ModalPopup
          onClose={onCloseModal}
          positionRef={target}
          isOpen={isOpen}
          placement="bottom-end"
        >
          <div
            className="bg-white shadow d-flex flex-column mt-1"
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
                  data-testId={action.id}
                >
                  <Icon
                    src={action.icon}
                    className="icon-size-24"
                  />
                  <span className="font-weight-normal ml-2">
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
};

ActionsDropdown.propTypes = {
  id: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  actionHandlers: PropTypes.objectOf(PropTypes.func).isRequired,
  iconSize: PropTypes.string,
  dropDownIconSize: PropTypes.bool,
  contentType: PropTypes.oneOf(['POST', 'COMMENT']).isRequired,
};

ActionsDropdown.defaultProps = {
  disabled: false,
  iconSize: 'sm',
  dropDownIconSize: false,
};

export default ActionsDropdown;
