import React from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';
import * as timeago from 'timeago.js';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Avatar } from '@edx/paragon';

import ActionsDropdown from '../../common/ActionsDropdown';
import { selectAuthorAvatars } from '../../posts/data/selectors';
import messages from '../messages';
import { commentShape } from './proptypes';

function CommentHeader({
  comment,
  actionHandlers,
  intl,
}) {
  const authorAvatars = useSelector(selectAuthorAvatars(comment.author));
  return (
    <div className="d-flex flex-row justify-content-between">
      <div className="align-items-center d-flex flex-row">
        <Avatar className="m-2" alt={comment.author} src={authorAvatars?.imageUrlSmall} />
        <div className="status small">
          <a href="#nowhere" className="font-weight-normal text-info-300 mr-1 small">
            {comment.author} {comment.authorLabel ? `(${comment.authorLabel})` : ''}
          </a>
          <div className="font-weight-normal small text-gray-500" title={comment.createdAt}>
            {intl.formatMessage(messages.commentTime, {
              relativeTime: timeago.format(comment.createdAt, intl.locale),
            })}
          </div>
        </div>
      </div>
      <ActionsDropdown commentOrPost={comment} actionHandlers={actionHandlers} />
    </div>
  );
}

CommentHeader.propTypes = {
  comment: commentShape.isRequired,
  actionHandlers: PropTypes.objectOf(PropTypes.func).isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(CommentHeader);
