import React from 'react';
import PropTypes from 'prop-types';

import { useDispatch } from 'react-redux';
import * as timeago from 'timeago.js';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Badge, Icon, IconButton, OverlayTrigger, Tooltip,
} from '@edx/paragon';
import {
  Locked, People, QuestionAnswer, QuestionAnswerOutline, StarFilled, StarOutline,
} from '@edx/paragon/icons';

import { updateExistingThread } from '../data/thunks';
import LikeButton from './LikeButton';
import messages from './messages';
import { postShape } from './proptypes';

function PostFooter({
  post,
  intl,
  preview,
}) {
  const dispatch = useDispatch();
  return (
    <div className="d-flex align-items-center">
      <LikeButton
        count={post.voteCount}
        onClick={() => dispatch(updateExistingThread(post.id, { voted: !post.voted }))}
        voted={post.voted}
      />
      <OverlayTrigger
        overlay={(
          <Tooltip id={`follow-${post.id}-tooltip`}>
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
          className="mx-2.5 my-0"
          src={post.following ? StarFilled : StarOutline}
        />
      </OverlayTrigger>
      {preview && post.commentCount > 1
        && (
          <>
            <Icon src={post.unreadCommentCount ? QuestionAnswer : QuestionAnswerOutline} className="mx-2 my-0" />
            <span style={{ minWidth: '2rem' }}>
              {post.commentCount}
            </span>
          </>
        )}
      {post.unreadCommentCount && post.unreadCommentCount > 0 && post.commentCount > 1 ? (
        <Badge variant="light">{intl.formatMessage(messages.newLabel, { count: post.unreadCommentCount })}</Badge>
      ) : null}
      <div className="d-flex flex-fill justify-content-end align-items-center">
        {
          post.groupId
            ? (
              <>
                <OverlayTrigger
                  overlay={(
                    <Tooltip id={`visibility-${post.id}-tooltip`}>
                      {post.groupName || intl.formatMessage(messages.visibleToAll)}
                    </Tooltip>
                  )}
                >
                  <Icon
                    data-testid="cohort-icon"
                    src={People}
                    className="text-gray-500"
                    style={{
                      width: '1em',
                      height: '1em',
                    }}
                  />
                </OverlayTrigger>
                <span className="text-gray-500 mx-1">·</span>
              </>
            ) : null
        }
        <span title={post.createdAt} className="text-gray-500">
          {timeago.format(post.createdAt, intl.locale)}
        </span>
        {!preview && post.closed
          && (
            <OverlayTrigger
              overlay={(
                <Tooltip id={`closed-${post.id}-tooltip`}>
                  {intl.formatMessage(messages.postClosed)}
                </Tooltip>
              )}
            >
              <Icon
                src={Locked}
                style={{
                  width: '1em',
                  height: '1em',
                }}
                className="ml-3"
              />
            </OverlayTrigger>
          )}
      </div>
    </div>
  );
}

PostFooter.propTypes = {
  intl: intlShape.isRequired,
  post: postShape.isRequired,
  preview: PropTypes.bool,
};

PostFooter.defaultProps = {
  preview: false,
};

export default injectIntl(PostFooter);
