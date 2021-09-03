import React from 'react';
import PropTypes from 'prop-types';

import { useDispatch } from 'react-redux';
import * as timeago from 'timeago.js';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Avatar, Icon, IconButton, OverlayTrigger, Tooltip,
} from '@edx/paragon';
import {
  Pin,
  QuestionAnswer,
  StarFilled,
  StarOutline,
} from '@edx/paragon/icons';

import { updateExistingThread } from '../data/thunks';
import LikeButton from './LikeButton';
import messages from './messages';

export const postShape = PropTypes.shape({
  abuseFlagged: PropTypes.bool,
  author: PropTypes.string,
  commentCount: PropTypes.number,
  courseId: PropTypes.string,
  following: PropTypes.bool,
  id: PropTypes.string,
  pinned: PropTypes.bool,
  rawBody: PropTypes.string,
  read: PropTypes.bool,
  title: PropTypes.string,
  topicId: PropTypes.string,
  type: PropTypes.string,
  updatedAt: PropTypes.string,
});

function PostTypeIcon(props) {
  return (
    <div className="m-1">
      {props.type === 'question' && <Icon src={QuestionAnswer} size="lg" />}
      {props.type === 'discussion' && <Icon src={QuestionAnswer} size="lg" />}
      {props.pinned && (
        <Icon
          src={Pin}
        />
      )}
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
}) {
  return (
    <div className="d-flex flex-fill justify-content-between">
      <Avatar className="m-2" alt={post.author} src={post.authorAvatars.imageUrlSmall} />
      <PostTypeIcon type={post.type} pinned={post.pinned} />
      <div className="align-items-center d-flex flex-row flex-fill">
        <div className="d-flex flex-column flex-fill">
          <span className="d-flex font-weight-bold">
            {post.title}
          </span>
          <span className="d-flex text-gray-500 x-small">
            <span title={post.createdAt}>
              {intl.formatMessage(
                messages.postedOn,
                {
                  author: post.author,
                  time: timeago.format(post.createdAt, intl.locale),
                  authorLabel: post.authorLabel ? `(${post.authorLabel})` : '',
                },
              )}
            </span>
          </span>
        </div>
      </div>
      <div className="d-flex mr-3">
        <Icon src={QuestionAnswer} />
        <span style={{ minWidth: '2rem' }}>
          {post.commentCount}
        </span>
      </div>
    </div>
  );
}

PostHeader.propTypes = {
  intl: intlShape.isRequired,
  post: postShape.isRequired,
};

function Post({
  post,
  intl,
}) {
  const dispatch = useDispatch();

  return (
    <div className="d-flex flex-column p-2.5 w-100">
      <PostHeader post={post} intl={intl} />
      <div className="d-flex mt-2 mb-0 p-0" dangerouslySetInnerHTML={{ __html: post.renderedBody }} />
      <div className="d-flex align-items-center">
        <LikeButton
          count={post.voteCount}
          onClick={() => dispatch(updateExistingThread(post.id, { voted: !post.voted }))}
          voted={post.voted}
        />
        <OverlayTrigger
          className="mx-2.5"
          overlay={(
            <Tooltip>
              {intl.formatMessage(post.following ? messages.unfollow : messages.follow)}
            </Tooltip>
          )}
        >
          <IconButton
            onClick={() => {
              dispatch(updateExistingThread(post.id, { following: !post.following }));
              return true;
            }}
            alt="Follow"
            iconAs={Icon}
            size="inline"
            src={post.following ? StarFilled : StarOutline}
          />
        </OverlayTrigger>
      </div>
    </div>
  );
}

Post.propTypes = {
  intl: intlShape.isRequired,
  post: postShape.isRequired,
};

export default injectIntl(Post);
