import React, { useCallback, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';

import { Icon, OverlayTrigger, Tooltip } from '@openedx/paragon';
import classNames from 'classnames';
import { generatePath, Link } from 'react-router-dom';
import * as timeago from 'timeago.js';

import { useIntl } from '@edx/frontend-platform/i18n';

import { Routes } from '../../data/constants';
import { useLearnerStatus } from '../data/hooks/useLearnerStatus';
import messages from '../messages';
import { getAuthorLabel } from '../utils';
import DiscussionContext from './context';
import timeLocale from './time-locale';

const AuthorLabel = ({
  author,
  authorLabel = null,
  linkToProfile = false,
  labelColor = '',
  alert = false,
  postCreatedAt = null,
  authorToolTip = false,
  postOrComment = false,
  postData = null, // Thread or comment data from API containing is_new_learner field
}) => {
  timeago.register('time-locale', timeLocale);
  const intl = useIntl();
  const { courseId, enableInContextSidebar } = useContext(DiscussionContext);
  const { icon, authorLabelMessage } = useMemo(
    () => getAuthorLabel(intl, authorLabel),
    [authorLabel],
  );
  const { isNewLearner, isRegularLearner } = useLearnerStatus(
    postData,
    author,
    authorLabel,
  );

  const isRetiredUser = author ? author.startsWith('retired__user') : false;
  const showTextPrimary = !authorLabelMessage && !isRetiredUser && !alert;
  const className = classNames(
    'd-flex align-items-center',
    { 'mb-0.5': !postOrComment },
    labelColor,
  );

  const showUserNameAsLink = (
    linkToProfile
    && author
    && author !== intl.formatMessage(messages.anonymous)
    && !enableInContextSidebar
  );

  const authorName = useMemo(
    () => (
      <span
        className={classNames('mr-1.5 font-style font-weight-500 author-name', {
          'text-gray-700': isRetiredUser,
          'text-primary-500': !authorLabelMessage && !isRetiredUser,
        })}
        role="heading"
        aria-level="2"
      >
        {isRetiredUser ? '[Deactivated]' : author}
      </span>
    ),
    [author, authorLabelMessage, isRetiredUser],
  );

  const createLearnerMessage = useCallback(
    (messageKey) => (
      <span
        className="text-gray-600 mt-0.5"
        style={{ fontSize: '12px', fontWeight: '400', lineHeight: '16px' }}
      >
        {intl.formatMessage(messages[messageKey])}
      </span>
    ),
    [intl],
  );

  const learnerMessageComponent = useMemo(() => {
    if (isNewLearner) {
      return createLearnerMessage('newLearnerMessage');
    }
    if (isRegularLearner) {
      return createLearnerMessage('learnerMessage');
    }
    return null;
  }, [isNewLearner, isRegularLearner, createLearnerMessage]);

  const labelContents = useMemo(
    () => (
      <>
        <OverlayTrigger
          placement={authorToolTip ? 'top' : 'right'}
          overlay={(
            <Tooltip
              id={
                authorToolTip
                  ? `endorsed-by-${author}-tooltip`
                  : `${authorLabel}-label-tooltip`
              }
            >
              <>
                {authorToolTip ? author : authorLabel}
                <br />
                {intl.formatMessage(messages.authorAdminDescription)}
              </>
            </Tooltip>
          )}
          trigger={['hover', 'focus']}
        >
          <div className={classNames('d-flex flex-row align-items-center')}>
            <Icon
              style={{
                width: '1rem',
                height: '1rem',
              }}
              src={icon}
              data-testid="author-icon"
            />
            {authorLabelMessage && (
              <span
                className={classNames('mr-1.5 font-style font-weight-500', {
                  'text-primary-500': showTextPrimary,
                  'text-gray-700': isRetiredUser,
                })}
                style={{ marginLeft: '2px' }}
              >
                {authorLabelMessage}
              </span>
            )}
          </div>
        </OverlayTrigger>
        {postCreatedAt && (
          <span
            title={postCreatedAt}
            className={classNames('align-content-center post-summary-timestamp', {
              'text-white': alert,
              'text-gray-500': !alert,
            })}
            style={{ lineHeight: '20px', fontSize: '12px', marginBottom: '-2.3px' }}
          >
            {timeago.format(postCreatedAt, 'time-locale')}
          </span>
        )}
      </>
    ),
    [
      author,
      authorLabelMessage,
      authorToolTip,
      icon,
      isRetiredUser,
      postCreatedAt,
      showTextPrimary,
      alert,
    ],
  );

  const learnerPostsLink = (
    <Link
      data-testid="learner-posts-link"
      id="learner-posts-link"
      to={generatePath(Routes.LEARNERS.POSTS, { learnerUsername: author, courseId })}
      className="text-decoration-none text-reset"
      style={{ width: 'fit-content' }}
    >
      {!alert && authorName}
    </Link>
  );

  return showUserNameAsLink ? (
    <div className={`${className} flex-wrap`}>
      <div className="d-flex flex-column w-100">
        <div className={classNames('d-flex align-items-center', labelColor)}>
          {!authorLabel ? (
            <OverlayTrigger
              placement={authorToolTip ? 'top' : 'right'}
              overlay={(
                <Tooltip
                  id={
                    authorToolTip
                      ? `endorsed-by-${author}-tooltip`
                      : `${authorLabel}-label-tooltip`
                  }
                >
                  <>
                    {intl.formatMessage(messages.authorLearnerTitle)}
                    <br />
                    {intl.formatMessage(messages.authorLearnerDescription)}
                  </>
                </Tooltip>
              )}
              trigger={['hover', 'focus']}
            >
              {learnerPostsLink}
            </OverlayTrigger>
          ) : (
            learnerPostsLink
          )}
          {labelContents}
        </div>
        {learnerMessageComponent}
      </div>
    </div>
  ) : (
    <div className={`${className} flex-wrap`}>
      <div className="d-flex flex-column w-100">
        <div className={classNames('d-flex align-items-center', labelColor)}>
          {authorName}
          {labelContents}
        </div>
        {learnerMessageComponent}
      </div>
    </div>
  );
};

AuthorLabel.propTypes = {
  author: PropTypes.string.isRequired,
  authorLabel: PropTypes.string,
  linkToProfile: PropTypes.bool,
  labelColor: PropTypes.string,
  alert: PropTypes.bool,
  postCreatedAt: PropTypes.string,
  authorToolTip: PropTypes.bool,
  postOrComment: PropTypes.bool,
  postData: PropTypes.shape({
    is_new_learner: PropTypes.bool,
    is_regular_learner: PropTypes.bool,
  }), // Thread or comment data from API
};

export default React.memo(AuthorLabel);
