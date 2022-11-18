import React from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import { useSelector } from 'react-redux';

import { injectIntl } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import {
  Avatar, Icon,
} from '@edx/paragon';

import { AvatarOutlineAndLabelColors, EndorsementStatus, ThreadType } from '../../../data/constants';
import { AuthorLabel } from '../../common';
import ActionsDropdown from '../../common/ActionsDropdown';
import { useAlertBannerVisible } from '../../data/hooks';
import { selectAuthorAvatars } from '../../posts/data/selectors';
import { useActions } from '../../utils';
import { commentShape } from './proptypes';

function CommentHeader({
  comment,
  postType,
  actionHandlers,
}) {
  const authorAvatars = useSelector(selectAuthorAvatars(comment.author));
  const colorClass = AvatarOutlineAndLabelColors[comment.authorLabel];
  const hasAnyAlert = useAlertBannerVisible(comment);

  const actions = useActions({
    ...comment,
    postType,
  });
  const actionIcons = actions.find(({ action }) => action === EndorsementStatus.ENDORSED);

  const handleIcons = (action) => {
    const actionFunction = actionHandlers[action];
    if (actionFunction) {
      actionFunction();
    } else {
      logError(`Unknown or unimplemented action ${action}`);
    }
  };
  return (
    <div className={classNames('d-flex flex-row justify-content-between', {
      'mt-2': hasAnyAlert,
    })}
    >
      <div className="align-items-center d-flex flex-row">
        <Avatar
          className={`border-0 ml-0.5 mr-2.5 ${colorClass ? `outline-${colorClass}` : 'outline-anonymous'}`}
          alt={comment.author}
          src={authorAvatars?.imageUrlSmall}
          style={{
            width: '32px',
            height: '32px',
          }}
        />
        <AuthorLabel
          author={comment.author}
          authorLabel={comment.authorLabel}
          labelColor={colorClass && `text-${colorClass}`}
          linkToProfile
        />
      </div>
      <div className="d-flex align-items-center">

        {actionIcons && (
        <span className="btn-icon btn-icon-sm mr-1 align-items-center">
          <Icon
            data-testid="check-icon"
            onClick={
                () => {
                  handleIcons(actionIcons.action);
                }
              }
            src={actionIcons.icon}
            className={['endorse', 'unendorse'].includes(actionIcons.id) ? 'text-dark-500' : 'text-success-500'}
            size="sm"
          />
        </span>
        )}

        <ActionsDropdown
          commentOrPost={{
            ...comment,
            postType,
          }}
          actionHandlers={actionHandlers}
        />
      </div>
    </div>
  );
}

CommentHeader.propTypes = {
  comment: commentShape.isRequired,
  actionHandlers: PropTypes.objectOf(PropTypes.func).isRequired,
  postType: PropTypes.oneOf([ThreadType.QUESTION, ThreadType.DISCUSSION]).isRequired,
};

export default injectIntl(CommentHeader);
