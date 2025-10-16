import React, {
  useCallback, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';

import {
  Button, Dropdown, Icon, IconButton, ModalPopup, useToggle,
} from '@openedx/paragon';
import { MoreHoriz } from '@openedx/paragon/icons';

import { useIntl } from '@edx/frontend-platform/i18n';

import { useLearnerActions } from './utils';

const LearnerActionsDropdown = ({
  actionHandlers,
  dropDownIconSize,
  userHasBulkDeletePrivileges,
}) => {
  const buttonRef = useRef();
  const intl = useIntl();
  const [isOpen, open, close] = useToggle(false);
  const [target, setTarget] = useState(null);
  const actions = useLearnerActions(userHasBulkDeletePrivileges);

  const handleActions = useCallback((action) => {
    const actionFunction = actionHandlers[action];
    if (actionFunction) {
      actionFunction();
    }
  }, [actionHandlers]);

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
        alt={intl.formatMessage({ id: 'discussions.learner.actions.alt', defaultMessage: 'Actions menu' })}
        src={MoreHoriz}
        iconAs={Icon}
        size="sm"
        ref={buttonRef}
        iconClassNames={dropDownIconSize ? 'dropdown-icon-dimensions' : ''}
      />
      <div className="actions-dropdown">
        <ModalPopup
          onClose={onCloseModal}
          positionRef={target}
          isOpen={isOpen}
          placement="bottom-start"
        >
          <div
            className="bg-white shadow d-flex flex-column mt-1"
            data-testid="learner-actions-dropdown-modal-popup"
          >
            {actions.map(action => (
              <React.Fragment key={action.id}>
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
                    {action.label.defaultMessage}
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

LearnerActionsDropdown.propTypes = {
  actionHandlers: PropTypes.objectOf(PropTypes.func).isRequired,
  dropDownIconSize: PropTypes.bool,
  userHasBulkDeletePrivileges: PropTypes.bool,
};

LearnerActionsDropdown.defaultProps = {
  dropDownIconSize: false,
  userHasBulkDeletePrivileges: false,
};

export default LearnerActionsDropdown;
