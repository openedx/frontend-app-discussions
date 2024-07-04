import React from 'react';
import PropTypes from 'prop-types';

import {
  Badge, Icon, OverlayTrigger, Tooltip,
} from '@openedx/paragon';
import {
  People, QuestionAnswer, QuestionAnswerOutline,
  StarFilled, StarOutline, ThumbUpFilled, ThumbUpOutline,
} from '@openedx/paragon/icons';
import { useSelector } from 'react-redux';
import * as timeago from 'timeago.js';

import { useIntl } from '@edx/frontend-platform/i18n';

import timeLocale from '../../common/time-locale';
import { selectUserHasModerationPrivileges } from '../../data/selectors';
import messages from './messages';

const PostSummaryFooter = ({
  postId,
  voted,
  voteCount,
  following,
  commentCount,
  unreadCommentCount,
  groupId,
  groupName,
  createdAt,
  preview,
  showNewCountLabel,
}) => {
  timeago.register('time-locale', timeLocale);
  const intl = useIntl();
  const userHasModerationPrivileges = useSelector(selectUserHasModerationPrivileges);

  return (
    <div className="d-flex align-items-center text-gray-700" style={{ height: '24px' }}>
      <div className="d-flex align-items-center mr-4.5">
        <OverlayTrigger
          overlay={(
            <Tooltip id={`liked-${postId}-tooltip`}>
              {intl.formatMessage(voted ? messages.likedPost : messages.postLikes)}
            </Tooltip>
          )}
        >
          <Icon src={voted ? ThumbUpFilled : ThumbUpOutline} className="post-summary-like-dimensions mr-0.5">
            <span className="sr-only">{' '}{intl.formatMessage(voted ? messages.likedPost : messages.postLikes)}</span>
          </Icon>
        </OverlayTrigger>
        <div className="font-style">
          {(voteCount && voteCount > 0) ? voteCount : null}
        </div>
      </div>

      <OverlayTrigger
        overlay={(
          <Tooltip id={`follow-${postId}-tooltip`}>
            {intl.formatMessage(following ? messages.followed : messages.notFollowed)}
          </Tooltip>
        )}
      >
        <Icon src={following ? StarFilled : StarOutline} className="post-summary-icons-dimensions mr-0.5">
          <span className="sr-only">
            {' '}{intl.formatMessage(following ? messages.srOnlyFollowDescription : messages.srOnlyUnFollowDescription)}
          </span>
        </Icon>
      </OverlayTrigger>

      {preview && commentCount > 1 && (
        <div className="d-flex align-items-center ml-4.5 text-gray-700 font-style">
          <OverlayTrigger
            overlay={(
              <Tooltip id={`follow-${postId}-tooltip`}>
                {intl.formatMessage(messages.activity)}
              </Tooltip>
            )}
          >
            <Icon
              src={unreadCommentCount ? QuestionAnswer : QuestionAnswerOutline}
              className="post-summary-comment-count-dimensions mr-0.5"
            >
              <span className="sr-only">{' '} {intl.formatMessage(messages.activity)}</span>
            </Icon>
          </OverlayTrigger>
          {commentCount}
        </div>
      )}
      {showNewCountLabel && preview && unreadCommentCount > 0 && commentCount > 1 && (
        <Badge variant="light" className="ml-2">
          {intl.formatMessage(messages.newLabel, { count: unreadCommentCount })}
        </Badge>
      )}
      <div className="d-flex flex-fill justify-content-end align-items-center">
        {groupId && userHasModerationPrivileges && (
          <OverlayTrigger
            overlay={(
              <Tooltip id={`visibility-${postId}-tooltip`}>{groupName}</Tooltip>
            )}
          >
            <span data-testid="cohort-icon" className="mr-2">
              <Icon
                src={People}
                className="text-gray-500 post-summary-icons-dimensions"
              />
            </span>
          </OverlayTrigger>
        )}
        <span title={createdAt} className="text-gray-700 post-summary-timestamp ml-0.5">
          {timeago.format(createdAt, 'time-locale')}
        </span>
      </div>
    </div>
  );
};

PostSummaryFooter.propTypes = {
  postId: PropTypes.string.isRequired,
  voted: PropTypes.bool.isRequired,
  voteCount: PropTypes.number.isRequired,
  following: PropTypes.bool.isRequired,
  commentCount: PropTypes.number.isRequired,
  unreadCommentCount: PropTypes.number.isRequired,
  groupId: PropTypes.number,
  groupName: PropTypes.string,
  createdAt: PropTypes.string.isRequired,
  preview: PropTypes.bool,
  showNewCountLabel: PropTypes.bool,
};

PostSummaryFooter.defaultProps = {
  preview: false,
  showNewCountLabel: false,
  groupId: null,
  groupName: null,
};

export default React.memo(PostSummaryFooter);
