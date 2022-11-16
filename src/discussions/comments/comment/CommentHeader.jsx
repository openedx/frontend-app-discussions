import React from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import { useSelector } from 'react-redux';

import { injectIntl } from '@edx/frontend-platform/i18n';
import { Avatar, Icon } from '@edx/paragon';
import { CheckCircle, Verified } from '@edx/paragon/icons';

import { AvatarOutlineAndLabelColors, ThreadType } from '../../../data/constants';
import { AuthorLabel } from '../../common';
import ActionsDropdown from '../../common/ActionsDropdown';
import { useAlertBannerVisible } from '../../data/hooks';
import { selectAuthorAvatars } from '../../posts/data/selectors';
import { commentShape } from './proptypes';

function CommentHeader({
  comment,
  postType,
  actionHandlers,
}) {
  const authorAvatars = useSelector(selectAuthorAvatars(comment.author));
  const colorClass = AvatarOutlineAndLabelColors[comment.authorLabel];
  const hasAnyAlert = useAlertBannerVisible(comment);

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
        {comment.endorsed && (
          <span className="btn-icon btn-icon-sm mr-1 align-items-center">
            {
              postType === 'question'
                ? <Icon src={CheckCircle} className="text-success" data-testid="check-icon" />
                : <Icon src={Verified} className="text-dark-500" data-testid="verified-icon" />
            }
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
