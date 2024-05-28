import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';

import { Icon, OverlayTrigger, Tooltip } from '@openedx/paragon';
import classNames from 'classnames';
import { generatePath, Link } from 'react-router-dom';
import * as timeago from 'timeago.js';

import { useIntl } from '@edx/frontend-platform/i18n';

import { Routes } from '../../data/constants';
import messages from '../messages';
import { getAuthorLabel } from '../utils';
import DiscussionContext from './context';
import timeLocale from './time-locale';

const AuthorLabel = ({
  author,
  authorLabel,
  linkToProfile,
  labelColor,
  alert,
  postCreatedAt,
  authorToolTip,
  postOrComment,
}) => {
  timeago.register('time-locale', timeLocale);
  const intl = useIntl();
  const { courseId, enableInContextSidebar } = useContext(DiscussionContext);
  const { icon, authorLabelMessage } = useMemo(() => getAuthorLabel(intl, authorLabel), [authorLabel]);

  const isRetiredUser = author ? author.startsWith('retired__user') : false;
  const showTextPrimary = !authorLabelMessage && !isRetiredUser && !alert;
  const className = classNames('d-flex align-items-center', { 'mb-0.5': !postOrComment }, labelColor);

  const showUserNameAsLink = linkToProfile && author && author !== intl.formatMessage(messages.anonymous)
                             && !enableInContextSidebar;

  const authorName = useMemo(() => (
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
  ), [author, authorLabelMessage, isRetiredUser]);

  const labelContents = useMemo(() => (
    <>
      <OverlayTrigger
        placement={authorToolTip ? 'top' : 'right'}
        overlay={(
          <Tooltip id={authorToolTip ? `endorsed-by-${author}-tooltip` : `${authorLabel}-label-tooltip`}>
            {authorToolTip ? author : authorLabel}
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
  ), [author, authorLabelMessage, authorToolTip, icon, isRetiredUser, postCreatedAt, showTextPrimary, alert]);

  return showUserNameAsLink
    ? (
      <div className={`${className} flex-wrap`}>
        <Link
          data-testid="learner-posts-link"
          id="learner-posts-link"
          to={generatePath(Routes.LEARNERS.POSTS, { learnerUsername: author, courseId })}
          className="text-decoration-none text-reset"
          style={{ width: 'fit-content' }}
        >
          {!alert && authorName}
        </Link>
        {labelContents}
      </div>
    )
    : <div className={`${className} flex-wrap`}>{authorName}{labelContents}</div>;
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
};

AuthorLabel.defaultProps = {
  linkToProfile: false,
  authorLabel: null,
  labelColor: '',
  alert: false,
  postCreatedAt: null,
  authorToolTip: false,
  postOrComment: false,
};

export default React.memo(AuthorLabel);
