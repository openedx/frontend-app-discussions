import React from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';
import * as timeago from 'timeago.js';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Avatar, Icon } from '@edx/paragon';
import {
  Help, Pin, Post as PostIcon, QuestionAnswer,
} from '@edx/paragon/icons';

import { ThreadType } from '../../../data/constants';
import ActionsDropdown from '../../common/ActionsDropdown';
import { selectAuthorAvatars } from '../data/selectors';
import messages from './messages';
import { postShape } from './proptypes';

export function PostTypeIcon(props) {
  return (
    <div className="m-1">
      {props.type === ThreadType.QUESTION && <Icon src={Help} size="lg" />}
      {props.type === ThreadType.DISCUSSION && <Icon src={PostIcon} size="lg" />}
      {props.pinned && (<Icon src={Pin} />)}
    </div>
  );
}

PostTypeIcon.propTypes = {
  type: PropTypes.string.isRequired,
  pinned: PropTypes.bool.isRequired,
};

function PostHeader({
  intl,
  post,
  preview,
  actionHandlers,
}) {
  const authorAvatars = useSelector(selectAuthorAvatars(post.author));

  return (
    <div className="d-flex flex-fill">
      <Avatar className="m-2" alt={post.author} src={authorAvatars?.imageUrlSmall} />
      <PostTypeIcon type={post.type} pinned={post.pinned} />
      <div className="align-items-center d-flex flex-row flex-fill">
        <div className="d-flex flex-column flex-fill">
          {preview
            ? <span className="h4">{post.title}</span>
            : <h3>{post.title}</h3>}
          <span title={post.createdAt} className="d-flex text-gray-500 x-small">
            {intl.formatMessage(
              messages.postedOn,
              {
                author: post.author,
                time: timeago.format(post.createdAt, intl.locale),
                authorLabel: post.authorLabel ? `(${post.authorLabel})` : '',
              },
            )}
          </span>
        </div>
      </div>
      {preview
        ? (
          <div className="d-flex">
            <Icon src={QuestionAnswer} />
            <span style={{ minWidth: '2rem' }}>
              {post.commentCount}
            </span>
          </div>
        )
        : <ActionsDropdown commentOrPost={post} actionHandlers={actionHandlers} />}
    </div>
  );
}

PostHeader.propTypes = {
  intl: intlShape.isRequired,
  post: postShape.isRequired,
  preview: PropTypes.bool.isRequired,
  actionHandlers: PropTypes.objectOf(PropTypes.func).isRequired,
};

export default injectIntl(PostHeader);
