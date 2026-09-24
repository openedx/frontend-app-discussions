import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';

import { Icon, OverlayTrigger, Tooltip } from '@openedx/paragon';
import classNames from 'classnames';
import { generatePath, Link } from 'react-router-dom';
import * as timeago from 'timeago.js';

import { useIntl } from '@edx/frontend-platform/i18n';

import { AvatarOutlineAndLabelColors, Routes } from '../../data/constants';
import { useLearnerStatus } from '../data/hooks/useLearnerStatus';
import messages from '../messages';
import { getAuthorLabel, getAuthorLabels } from '../utils';
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
  const { authorLabelMessage } = useMemo(
    () => getAuthorLabel(intl, authorLabel),
    [authorLabel, intl],
  );
  // All matched roles for multi-role display
  const authorRolesList = useMemo(
    () => getAuthorLabels(intl, authorLabel),
    [authorLabel, intl],
  );
  const { isNewLearner, isRegularLearner } = useLearnerStatus(
    postData,
    author,
    authorLabel,
  );

  // For multi-role display, avoid applying one shared color to the whole row.
  const appliedLabelColor = authorRolesList.length > 1 ? '' : labelColor;

  const isRetiredUser = author ? author.startsWith('retired__user') : false;
  const className = classNames(
    'd-flex align-items-center',
    { 'mb-0.5': !postOrComment },
    appliedLabelColor,
  );

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
  ), [author, authorLabelMessage, authorToolTip, icon, isRetiredUser, postCreatedAt, showTextPrimary, alert]);

  const roleContents = useMemo(
    () => {
      if (authorRolesList.length > 0) {
        const firstRole = authorRolesList[0].role;

        return (
          <OverlayTrigger
            placement={authorToolTip ? 'top' : 'right'}
            overlay={(
              <Tooltip
                id={
                  authorToolTip
                    ? `endorsed-by-${author}-tooltip`
                    : `${firstRole.toLowerCase().replace(/\s+/g, '-')}-label-tooltip`
                }
              >
                <>
                  {authorToolTip
                    ? author
                    : authorRolesList.map(role => role.authorLabelMessage).join(', ')}
                  <br />
                  {intl.formatMessage(messages.authorLearnerDescription)}
                </>
              </Tooltip>
        )}
            trigger={['hover', 'focus']}
          >
            <div className="d-flex flex-row align-items-center author-role-label">
              {authorRolesList.map((roleEntry, index) => (
                <React.Fragment key={roleEntry.role}>
                  {index > 0 && (
                    <span className="font-style font-weight-500" style={{ margin: '0 2px' }}>,</span>
                  )}
                  <span
                    className={classNames(
                      'd-flex flex-row align-items-center',
                      AvatarOutlineAndLabelColors[roleEntry.role]
                      && `text-${AvatarOutlineAndLabelColors[roleEntry.role]}`,
                    )}
                  >
                    <Icon
                      style={{
                        width: '1rem',
                        height: '1rem',
                        flexShrink: 0,
                        marginLeft: index === 0 ? '0' : '2px',
                      }}
                      src={roleEntry.icon}
                      data-testid="author-icon"
                    />
                    <span
                      className="font-style font-weight-500"
                      style={{
                        marginLeft: '2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {roleEntry.authorLabelMessage}
                    </span>
                  </span>
                </React.Fragment>
              ))}
            </div>
          </OverlayTrigger>
        );
      }

      return null;
    },
    [
      author,
      authorRolesList,
      authorToolTip,
      intl,
    ],
  );

  const timestamp = useMemo(() => (
    postCreatedAt ? (
      <span
        title={postCreatedAt}
        className={classNames('align-content-center post-summary-timestamp ml-1', {
          'text-white': alert,
          'text-gray-500': !alert,
        })}
        style={{ lineHeight: '20px', fontSize: '12px' }}
      >
        {timeago.format(postCreatedAt, 'time-locale')}
      </span>
    ) : null
  ), [postCreatedAt, alert]);

  const learnerPostsLink = author ? (
    <Link
      data-testid="learner-posts-link"
      id="learner-posts-link"
      to={generatePath(Routes.LEARNERS.POSTS, { learnerUsername: author, courseId })}
      className="text-decoration-none text-reset"
      style={{ width: 'fit-content' }}
    >
      {!alert && authorName}
    </Link>
  ) : (
    <span style={{ width: 'fit-content' }}>
      {!alert && authorName}
    </span>
  );

  if (singleLine) {
    return (
      <div className={className}>
        <div className={classNames('d-flex align-items-center flex-nowrap', appliedLabelColor)} style={{ minWidth: 0, overflow: 'hidden' }}>
          {showUserNameAsLink ? learnerPostsLink : authorName}
          {roleBeforeTimestamp && roleContents}
          {timestamp}
          {!roleBeforeTimestamp && roleContents}
          {bannedIndicator}
        </div>
      </div>
    );
  }

  return showUserNameAsLink ? (
    <div className={`${className} flex-wrap`}>
      <div className="d-flex flex-column w-100" style={{ minWidth: 0 }}>
        <div className={classNames('d-flex align-items-center', appliedLabelColor)} style={{ minWidth: 0, overflow: 'hidden' }}>
          {learnerPostsLink}
          {timestamp}
        </div>
        <div className={classNames('d-flex align-items-center', appliedLabelColor)} style={{ minWidth: 0, overflow: 'hidden' }}>
          {roleContents}
          {bannedIndicator}
        </div>
        {postOrComment && learnerMessageComponent}
      </div>
    </div>
  ) : (
    <div className={`${className} flex-wrap`}>
      <div className="d-flex flex-column w-100" style={{ minWidth: 0 }}>
        <div className={classNames('d-flex align-items-center', appliedLabelColor)} style={{ minWidth: 0, overflow: 'hidden' }}>
          {authorName}
          {timestamp}
        </div>
        <div className={classNames('d-flex align-items-center', appliedLabelColor)} style={{ minWidth: 0, overflow: 'hidden' }}>
          {roleContents}
          {bannedIndicator}
        </div>
        {postOrComment && learnerMessageComponent}
      </div>
    </div>
  );
};

AuthorLabel.propTypes = {
  author: PropTypes.string,
  authorLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
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
