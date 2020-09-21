import React from 'react';
import PropTypes from 'prop-types';

import {
  faQuestionCircle,
  faStar as faEmptyStar,
  faThumbsUp as faEmptyThumb,
} from '@fortawesome/free-regular-svg-icons';
import {
  faComments,
  faStar as faSolidStar,
  faThumbsUp as faSolidThumb,
  faThumbtack,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDispatch } from 'react-redux';
import * as timeago from 'timeago.js';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Avatar, IconButton, OverlayTrigger, Tooltip,
} from '@edx/paragon';

import { updateExistingThread } from '../data/thunks';
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
      {props.type === 'question' && <FontAwesomeIcon icon={faQuestionCircle} size="lg" />}
      {props.type === 'discussion' && <FontAwesomeIcon icon={faComments} size="lg" />}
      {props.pinned && (
        <FontAwesomeIcon
          icon={faThumbtack}
          size="sm"
          className="position-relative bg-white rounded"
          style={{
            left: '-0.25rem',
            bottom: '-0.75rem',
            padding: '0.125rem',
          }}
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
    <div className="d-flex flex-fill">
      <Avatar className="my-1" alt={post.author} src={post.authorAvatars.imageUrlSmall} />
      <div className="d-flex flex-row flex-fill">
        <PostTypeIcon type={post.type} pinned={post.pinned} />
        <div className="d-flex flex-column flex-fill">
          <span className="d-flex font-weight-bold text-gray">
            {post.title}
          </span>
          <span className="d-flex small text-gray-300">
            {post.author}{' | '}
            <span title={post.createdAt}>
              {intl.formatMessage(messages.postedOn, { time: timeago.format(post.createdAt, intl.locale) })}
            </span>
          </span>
        </div>
        <div className="d-flex align-items-center mr-3">
          <FontAwesomeIcon icon={faComments} className="mr-2" />
          <span style={{ minWidth: '2rem' }}>
            {post.commentCount}
          </span>
        </div>
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
    <div className="d-flex flex-column mt-2">
      <PostHeader post={post} intl={intl} />
      <div className="d-flex mt-2 mb-0 p-0" dangerouslySetInnerHTML={{ __html: post.renderedBody }} />
      <div className="d-flex align-items-center">
        <div className="d-flex align-items-center">
          <OverlayTrigger overlay={(
            <Tooltip>
              {intl.formatMessage(post.voted ? messages.removeLike : messages.like)}
            </Tooltip>
          )}
          >
            <IconButton
              onClick={(e) => {
                e.preventDefault();
                dispatch(updateExistingThread(post.id, { voted: !post.voted }));
                return false;
              }}
              alt="Like"
              size="inline"
              icon={post.voted ? faSolidThumb : faEmptyThumb}
            />
          </OverlayTrigger>
          {post.voteCount}
        </div>
        <OverlayTrigger overlay={(
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
            size="inline"
            icon={post.following ? faSolidStar : faEmptyStar}
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
