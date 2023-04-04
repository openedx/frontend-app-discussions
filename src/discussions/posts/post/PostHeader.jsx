import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Avatar, Badge, Icon } from '@edx/paragon';

import { Issue, Question } from '../../../components/icons';
import { AvatarOutlineAndLabelColors, ThreadType } from '../../../data/constants';
import { AuthorLabel } from '../../common';
import { useAlertBannerVisible } from '../../data/hooks';
import messages from './messages';
import { postShape } from './proptypes';

export function PostAvatar({
  post, authorLabel, fromPostLink, read,
}) {
  const outlineColor = AvatarOutlineAndLabelColors[authorLabel];

  const avatarSize = useMemo(() => {
    let size = '2rem';
    if (post.type === ThreadType.DISCUSSION && !fromPostLink) {
      size = '2rem';
    } else if (post.type === ThreadType.QUESTION) {
      size = '1.5rem';
    }
    return size;
  }, [post.type]);

  const avatarSpacing = useMemo(() => {
    let spacing = 'mr-3 ';
    if (post.type === ThreadType.DISCUSSION && fromPostLink) {
      spacing += 'pt-2 ml-0.5';
    } else if (post.type === ThreadType.DISCUSSION) {
      spacing += 'ml-0.5 mt-0.5';
    }
    return spacing;
  }, [post.type]);

  return (
    <div className={avatarSpacing}>
      {post.type === ThreadType.QUESTION && (
        <Icon
          src={read ? Issue : Question}
          className={classNames('position-absolute bg-white rounded-circle question-icon-size', {
            'question-icon-position': fromPostLink,
          })}
        />
      )}
      <Avatar
        className={classNames('border-0 mt-1', {
          [`outline-${outlineColor}`]: outlineColor,
          'outline-anonymous': !outlineColor,
          'mt-3 ml-2': post.type === ThreadType.QUESTION && fromPostLink,
          'avarat-img-position mt-17px': post.type === ThreadType.QUESTION,
        })}
        style={{
          height: avatarSize,
          width: avatarSize,
        }}
        alt={post.author}
      />
    </div>
  );
}

PostAvatar.propTypes = {
  post: postShape.isRequired,
  authorLabel: PropTypes.string,
  fromPostLink: PropTypes.bool,
  read: PropTypes.bool,
};

PostAvatar.defaultProps = {
  authorLabel: null,
  fromPostLink: false,
  read: false,
};

function PostHeader({
  intl,
  post,
  preview,
}) {
  const showAnsweredBadge = preview && post.hasEndorsed && post.type === ThreadType.QUESTION;
  const authorLabelColor = AvatarOutlineAndLabelColors[post.authorLabel];
  const hasAnyAlert = useAlertBannerVisible(post);

  return (
    <div className={classNames('d-flex flex-fill mw-100', { 'mt-10px': hasAnyAlert && !preview })}>
      <div className="flex-shrink-0">
        <PostAvatar post={post} authorLabel={post.authorLabel} />
      </div>
      <div className="align-items-center d-flex flex-row">
        <div className="d-flex flex-column justify-content-start mw-100">
          {preview
            ? (
              <div className="h4 d-flex align-items-center pb-0 mb-0 flex-fill">
                <div className="flex-fill text-truncate" role="heading" aria-level="1">
                  {post.title}
                </div>
                {showAnsweredBadge
                  && <Badge variant="success">{intl.formatMessage(messages.answered)}</Badge>}
              </div>
            )
            : (
              <h5
                className="mb-0 font-style text-primary-500"
                style={{ lineHeight: '21px' }}
                aria-level="1"
                tabIndex="-1"
                accessKey="h"
              >
                {post.title}
              </h5>
            )}
          <AuthorLabel
            author={post.author || intl.formatMessage(messages.anonymous)}
            authorLabel={post.authorLabel}
            labelColor={authorLabelColor && `text-${authorLabelColor}`}
            linkToProfile
            postCreatedAt={post.createdAt}
            postOrComment
          />
        </div>
      </div>
    </div>
  );
}

PostHeader.propTypes = {
  intl: intlShape.isRequired,
  post: postShape.isRequired,
  preview: PropTypes.bool,
};

PostHeader.defaultProps = {
  preview: false,
};

export default injectIntl(PostHeader);
