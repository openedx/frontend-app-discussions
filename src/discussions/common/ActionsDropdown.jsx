import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import {
  Button, Dropdown, Icon, IconButton, ModalPopup, useToggle,
} from '@edx/paragon';
import { MoreHoriz } from '@edx/paragon/icons';

import { ContentActions } from '../../data/constants';
import { commentShape } from '../comments/comment/proptypes';
import { selectBlackoutDate } from '../data/selectors';
import messages from '../messages';
import { postShape } from '../posts/post/proptypes';
import { inBlackoutDateRange, useActions } from '../utils';
import { DiscussionContext } from './context';

function ActionsDropdown({
  intl,
  commentOrPost,
  disabled,
  actionHandlers,
}) {
  const [isOpen, open, close] = useToggle(false);
  const [target, setTarget] = useState(null);
  const actions = useActions(commentOrPost);
  const { inContext } = useContext(DiscussionContext);
  const handleActions = (action) => {
    const actionFunction = actionHandlers[action];
    if (actionFunction) {
      actionFunction();
    } else {
      logError(`Unknown or unimplemented action ${action}`);
    }
  };
  const blackoutDateRange = useSelector(selectBlackoutDate);
  // Find and remove edit action if in blackout date range.
  if (inBlackoutDateRange(blackoutDateRange)) {
    actions.splice(actions.findIndex(action => action.id === 'edit'), 1);
  }
  return (
    <>
      <IconButton
        onClick={open}
        alt={intl.formatMessage(messages.actionsAlt)}
        src={MoreHoriz}
        iconAs={Icon}
        disabled={disabled}
        size="sm"
        ref={setTarget}
      />
      <ModalPopup
        onClose={close}
        positionRef={target}
        isOpen={isOpen}
        placement={inContext ? 'left' : 'auto-start'}
      >
        <div
          className="bg-white p-1 shadow d-flex flex-column"
          data-testid="actions-dropdown-modal-popup"
        >
          {actions.map(action => (
            <React.Fragment key={action.id}>
              {action.action === ContentActions.DELETE
              && <Dropdown.Divider />}

              <Dropdown.Item
                as={Button}
                variant="tertiary"
                size="inline"
                onClick={() => {
                  close();
                  handleActions(action.action);
                }}
                className="d-flex justify-content-start py-1.5 mr-4"
              >
                <Icon src={action.icon} className="mr-1" /> {intl.formatMessage(action.label)}
              </Dropdown.Item>
            </React.Fragment>
          ))}
        </div>
      </ModalPopup>
    </>
  );
}

ActionsDropdown.propTypes = {
  intl: intlShape.isRequired,
  commentOrPost: PropTypes.oneOfType([commentShape, postShape]).isRequired,
  disabled: PropTypes.bool,
  actionHandlers: PropTypes.objectOf(PropTypes.func).isRequired,
};

ActionsDropdown.defaultProps = {
  disabled: false,
};

export default injectIntl(ActionsDropdown);
