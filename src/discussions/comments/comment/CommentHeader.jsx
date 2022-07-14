import React from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';

import { injectIntl } from '@edx/frontend-platform/i18n';
import { Avatar, Icon } from '@edx/paragon';
import { CheckCircle, Verified } from '@edx/paragon/icons';

import { AvatarOutlineAndLabelColors, ThreadType } from '../../../data/constants';
import { AuthorLabel } from '../../common';
import ActionsDropdown from '../../common/ActionsDropdown';
import { selectAuthorAvatars } from '../../posts/data/selectors';
import { commentShape } from './proptypes';

function CommentHeader({
  comment,
  postType,
  actionHandlers,
}) {
  const authorAvatars = useSelector(selectAuthorAvatars(comment.author));
  const colorClass = AvatarOutlineAndLabelColors[comment.authorLabel];
  return (
    <div className="d-flex flex-row justify-content-between">
      <div className="align-items-center d-flex flex-row">
        <Avatar
          className={`m-2 border-0 ${colorClass ? `outline-${colorClass}` : 'outline-anonymous'}`}
          alt={comment.author}
          src={authorAvatars?.imageUrlSmall}
        />
        <AuthorLabel author={comment.author} authorLabel={comment.authorLabel} labelColor={colorClass && `text-${colorClass}`} />
      </div>
      <div className="d-flex align-items-center">
        {comment.endorsed && (postType === 'question'
          ? <Icon src={CheckCircle} className="text-success" data-testid="check-icon" />
          : <Icon src={Verified} data-testid="verified-icon" />)}
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
