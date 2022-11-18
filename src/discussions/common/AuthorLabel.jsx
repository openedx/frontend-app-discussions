import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import { Link, useLocation } from 'react-router-dom';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon } from '@edx/paragon';
import { Institution, School } from '@edx/paragon/icons';

import { Routes } from '../../data/constants';
import { useShowLearnersTab } from '../data/hooks';
import messages from '../messages';
import { discussionsPath } from '../utils';
import { DiscussionContext } from './context';

function AuthorLabel({
  intl,
  author,
  authorLabel,
  linkToProfile,
  labelColor,
  alert,
}) {
  const location = useLocation();
  const { courseId } = useContext(DiscussionContext);
  let icon = null;
  let authorLabelMessage = null;

  if (authorLabel === 'Staff') {
    icon = Institution;
    authorLabelMessage = intl.formatMessage(messages.authorLabelStaff);
  }
  if (authorLabel === 'Community TA') {
    icon = School;
    authorLabelMessage = intl.formatMessage(messages.authorLabelTA);
  }

  const isRetiredUser = author ? author.startsWith('retired__user') : false;

  const className = classNames('d-flex align-items-center', labelColor);

  const showUserNameAsLink = useShowLearnersTab()
      && linkToProfile && author && author !== intl.formatMessage(messages.anonymous);

  const labelContents = (
    <div className={className}>
      <span
        className={classNames('mr-1 font-size-14 font-style-normal font-family-inter font-weight-500', {
          'text-gray-700': isRetiredUser,
          'text-primary-500': !authorLabelMessage && !isRetiredUser && !alert,
        })}
        role="heading"
        aria-level="2"
      >
        {isRetiredUser ? '[Deactivated]' : author }
      </span>
      {icon && (
        <Icon
          style={{
            width: '1rem',
            height: '1rem',
          }}
          src={icon}
        />
      )}
      {authorLabelMessage && (
        <span
          className={classNames('mr-1 font-size-14 font-style-normal font-family-inter font-weight-500', {
            'text-primary-500': !authorLabelMessage && !isRetiredUser && !alert,
            'text-gray-700': isRetiredUser,
          })}
          style={{ marginLeft: '2px' }}
        >
          {authorLabelMessage}
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
};

AuthorLabel.defaultProps = {
  linkToProfile: false,
  authorLabel: null,
  labelColor: '',
  alert: false,
};

export default injectIntl(AuthorLabel);
