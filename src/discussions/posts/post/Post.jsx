import React from 'react';
import PropTypes from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router';
import * as timeago from 'timeago.js';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Avatar, Icon, IconButton, OverlayTrigger, Tooltip,
} from '@edx/paragon';
import {
  Help, Pin, Post as PostIcon, QuestionAnswer, StarFilled, StarOutline,
} from '@edx/paragon/icons';

import { ContentActions, ThreadType } from '../../../data/constants';
import ActionsDropdown from '../../common/ActionsDropdown';
import { selectAuthorAvatars } from '../data/selectors';
import { removeThread, updateExistingThread } from '../data/thunks';
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
      {props.type === ThreadType.QUESTION && <Icon src={Help} size="lg" />}
      {props.type === ThreadType.DISCUSSION && <Icon src={PostIcon} size="lg" />}
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
  preview,
  actionHandlers,
}) {
  const authorAvatars = useSelector(selectAuthorAvatars(post.author));

  return (
    <div className="d-flex flex-fill">
      <Avatar className="m-2" alt={post.author} src={authorAvatars.imageUrlSmall} />
      <PostTypeIcon type={post.type} pinned={post.pinned} />
      <div className="align-items-center d-flex flex-row flex-fill">
        <div className="d-flex flex-column flex-fill">
          <span className="font-weight-bold">
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

function Post({
  post,
  preview,
  intl,
}) {
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const actionHandlers = {
    [ContentActions.EDIT_CONTENT]: () => history.push(`${location.pathname}/edit`),
    // TODO: Add flow to confirm before deleting
    [ContentActions.DELETE]: () => dispatch(removeThread(post.id)),
    [ContentActions.CLOSE]: () => dispatch(updateExistingThread(post.id, { closed: !post.closed })),
    [ContentActions.PIN]: () => dispatch(updateExistingThread(post.id, { pinned: !post.pinned })),
    [ContentActions.REPORT]: () => dispatch(updateExistingThread(post.id, { flagged: !post.abuseFlagged })),
  };

  return (
    <div className="d-flex flex-column p-2.5 w-100">
      <PostHeader post={post} intl={intl} preview={preview} actionHandlers={actionHandlers} />
      <div
        className="d-block mt-2 mb-0 p-0 overflow-hidden text-break"
        dangerouslySetInnerHTML={{ __html: post.renderedBody }}
        style={{
          maxHeight: preview ? '3rem' : null,
          maxWidth: preview ? '80%' : null,
        }}
      />
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
        {post.following && <span>Following</span>}
      </div>
    </div>
  );
}

Post.propTypes = {
  intl: intlShape.isRequired,
  post: postShape.isRequired,
  preview: PropTypes.bool.isRequired,
};

export default injectIntl(Post);
