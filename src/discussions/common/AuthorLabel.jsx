import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import { Link, useLocation } from 'react-router-dom';
import * as timeago from 'timeago.js';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon, OverlayTrigger, Tooltip } from '@edx/paragon';
import { Institution, School } from '@edx/paragon/icons';

import { Routes } from '../../data/constants';
import { useShowLearnersTab } from '../data/hooks';
import messages from '../messages';
import { discussionsPath } from '../utils';
import { DiscussionContext } from './context';
import timeLocale from './time-locale';

function AuthorLabel({
  intl,
  author,
  authorLabel,
  linkToProfile,
  labelColor,
  alert,
  postCreatedAt,
  authorToolTip,
  postOrComment,
}) {
  const location = useLocation();
  const { courseId } = useContext(DiscussionContext);
  let icon = null;
  let authorLabelMessage = null;
  timeago.register('time-locale', timeLocale);

  if (authorLabel === 'Staff') {
    icon = Institution;
    authorLabelMessage = intl.formatMessage(messages.authorLabelStaff);
  }
  if (authorLabel === 'Community TA') {
    icon = School;
    authorLabelMessage = intl.formatMessage(messages.authorLabelTA);
  }

  const isRetiredUser = author ? author.startsWith('retired__user') : false;
  const showTextPrimary = !authorLabelMessage && !isRetiredUser && !alert;

  const className = classNames('d-flex align-items-center', { 'mb-0.5': !postOrComment }, labelColor);

  const showUserNameAsLink = useShowLearnersTab()
    && linkToProfile && author && author !== intl.formatMessage(messages.anonymous);

  const labelContents = (
    <div className={className} style={{ lineHeight: '24px' }}>
      {!alert && (
        <span
          className={classNames('mr-1.5 font-size-14 font-style-normal font-family-inter font-weight-500', {
            'text-gray-700': isRetiredUser,
            'text-primary-500': !authorLabelMessage && !isRetiredUser,
          })}
          role="heading"
          aria-level="2"
        >
          {isRetiredUser ? '[Deactivated]' : author}
        </span>
      )}

      <OverlayTrigger
        overlay={(
          <Tooltip id={`endorsed-by-${author}-tooltip`}>
            {author}
          </Tooltip>
        )}

        trigger={['hover', 'focus']}
      >
        <div className={classNames('d-flex flex-row align-items-center', {
          'disable-div': !authorToolTip,
        })}
        >
          <Icon
            style={{
              width: '1rem',
              height: '1rem',
            }}
            src={icon}
            data-testid="author-icon"
          />

        </div>
      </OverlayTrigger>
      {authorLabelMessage && (
        <span
          className={classNames('mr-1.5 font-size-14 font-style-normal font-family-inter font-weight-500', {
            'text-primary-500': showTextPrimary,
            'text-gray-700': isRetiredUser,
          })}
          style={{ marginLeft: '2px' }}
        >
          {authorLabelMessage}
        </span>
      )}
      {postCreatedAt && (
        <span
          title={postCreatedAt}
          className={classNames('font-family-inter align-content-center', {
            'text-white': alert,
            'text-gray-500': !alert,
          })}
          style={{ lineHeight: '20px', fontSize: '12px', marginBottom: '-2.3px' }}
        >
          {timeago.format(postCreatedAt, 'time-locale')}
        </span>
      )}

    </div>
  );

  return showUserNameAsLink
    ? (
      <Link
        data-testid="learner-posts-link"
        id="learner-posts-link"
        to={discussionsPath(Routes.LEARNERS.POSTS, { learnerUsername: author, courseId })(location)}
        className="text-decoration-none"
        style={{ width: 'fit-content' }}
      >
        {labelContents}
      </Link>
    )
    : <>{labelContents}</>;
}

AuthorLabel.propTypes = {
  intl: intlShape.isRequired,
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

export default injectIntl(AuthorLabel);
