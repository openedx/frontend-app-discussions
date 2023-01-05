import React from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';
import * as timeago from 'timeago.js';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Badge, Icon, OverlayTrigger, Tooltip,
} from '@edx/paragon';
import {
  Locked,
} from '@edx/paragon/icons';

import {
  People,
  QuestionAnswer,
  QuestionAnswerOutline,
  StarFilled,
  StarOutline, ThumbUpFilled, ThumbUpOutline,
} from '../../../components/icons';
import timeLocale from '../../common/time-locale';
import { selectUserHasModerationPrivileges } from '../../data/selectors';
import messages from './messages';
import { postShape } from './proptypes';

function PostSummaryFooter({
  post,
  intl,
  preview,
  showNewCountLabel,
}) {
  const userHasModerationPrivileges = useSelector(selectUserHasModerationPrivileges);
  timeago.register('time-locale', timeLocale);

  return (
    <div className="d-flex align-items-center text-gray-700">
      <div className="d-flex align-items-center mr-4.5">
        <OverlayTrigger
          overlay={(
            <Tooltip id={`liked-${post.id}-tooltip`}>
              {intl.formatMessage(post.voted ? messages.likedPost : messages.postLikes)}
            </Tooltip>
          )}
        >
          <Icon src={post.voted ? ThumbUpFilled : ThumbUpOutline} className="post-summary-icons-dimensions mr-0.5">
            <span className="sr-only">{' '}{intl.formatMessage(post.voted ? messages.likedPost : messages.postLikes)}</span>
          </Icon>
        </OverlayTrigger>
        <div className="font-family-inter font-style-normal">
          {(post.voteCount && post.voteCount > 0) ? post.voteCount : null}
        </div>
      </div>

      <OverlayTrigger
        overlay={(
          <Tooltip id={`follow-${post.id}-tooltip`}>
            {intl.formatMessage(post.following ? messages.followed : messages.notFollowed)}
          </Tooltip>
        )}
      >
        <Icon src={post.following ? StarFilled : StarOutline} className="post-summary-icons-dimensions mr-0.5">
          <span className="sr-only">{' '}{ intl.formatMessage(post.following ? messages.srOnlyFollowDescription : messages.srOnlyUnFollowDescription)}</span>
        </Icon>
      </OverlayTrigger>

      {preview && post.commentCount > 1 && (
        <div className="d-flex align-items-center ml-4.5">
          <OverlayTrigger
            overlay={(
              <Tooltip id={`follow-${post.id}-tooltip`}>
                {intl.formatMessage(messages.activity)}
              </Tooltip>
            )}
          >
            <Icon src={post.unreadCommentCount ? QuestionAnswer : QuestionAnswerOutline} className="post-summary-icons-dimensions mr-0.5">
              <span className="sr-only">{' '} {intl.formatMessage(messages.activity)}</span>
            </Icon>
          </OverlayTrigger>
          {post.commentCount}
        </div>
      )}
      {showNewCountLabel && preview && post?.unreadCommentCount > 0 && post.commentCount > 1 && (
        <Badge variant="light" className="ml-2">
          {intl.formatMessage(messages.newLabel, { count: post.unreadCommentCount })}
        </Badge>
      )}
      <div className="d-flex flex-fill justify-content-end align-items-center">
        {post.groupId && userHasModerationPrivileges && (
          <>
            <OverlayTrigger
              overlay={(
                <Tooltip id={`visibility-${post.id}-tooltip`}>{post.groupName}</Tooltip>
              )}
            >
              <span data-testid="cohort-icon" className="post-summary-icons-dimensions">
                <People />
              </span>
            </OverlayTrigger>
            <span
              className="text-gray-700 mx-1.5 font-weight-500"
              style={{ fontSize: '16px' }}
            >
              ·
            </span>
          </>
        )}
        <span title={post.createdAt} className="text-gray-700 post-summary-timestamp">
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
                  width: '1rem',
                  height: '1rem',
                }}
                className="ml-3 post-summary-icons-dimensions"
              />
            </OverlayTrigger>
          )}
      </div>
    </div>
  );
}

PostSummaryFooter.propTypes = {
  intl: intlShape.isRequired,
  post: postShape.isRequired,
  preview: PropTypes.bool,
  showNewCountLabel: PropTypes.bool,
};

PostSummaryFooter.defaultProps = {
  preview: false,
  showNewCountLabel: false,
};

export default injectIntl(PostSummaryFooter);
