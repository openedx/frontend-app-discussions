import React from 'react';
import PropTypes from 'prop-types';

import { useDispatch } from 'react-redux';
import * as timeago from 'timeago.js';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Badge, Icon, IconButton, OverlayTrigger, Tooltip,
} from '@edx/paragon';
import {
  Locked, People,
} from '@edx/paragon/icons';

import {
  QuestionAnswer,
  QuestionAnswerOutline,
  StarFilled,
  StarOutline,
} from '../../../components/icons';
import timeLocale from '../../common/time-locale';
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
  timeago.register('time-locale', timeLocale);
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
          src={post.following ? StarFilled : StarOutline}
        />
      </OverlayTrigger>
      {preview && post.commentCount > 1
        && (
          <>
            <Icon src={post.unreadCommentCount ? QuestionAnswer : QuestionAnswerOutline} className="ml-4 mr-2 my-0 mt-1.5" />
            <span style={{ minWidth: '1rem' }}>
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
                    style={{
                      width: '1em',
                      height: '1em',
                      color: 'black',
                    }}
                  />
                </OverlayTrigger>
                <span
                  className="text-light-700 mx-1.5 ml-1.5 font-weight-500"
                  style={{
                    height: '1.5rem',
                    width: '0.31rem',
                    fontSize: '16px',
                  }}
                >
                  ·
                </span>
              </>
            ) : null
        }
        <span title={post.createdAt} className="text-gray-500">
          {timeago.format(post.createdAt, 'time-locale')}
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
