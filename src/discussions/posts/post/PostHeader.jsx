import React from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Avatar, Badge, Icon } from '@edx/paragon';

import { Question } from '../../../components/icons';
import { AvatarOutlineAndLabelColors, ThreadType } from '../../../data/constants';
import { ActionsDropdown, AuthorLabel } from '../../common';
import { selectAuthorAvatars } from '../data/selectors';
import messages from './messages';
import { postShape } from './proptypes';

export function PostAvatar({ post, authorLabel, fromPostLink }) {
  const authorAvatars = useSelector(selectAuthorAvatars(post.author));
  const outlineColor = AvatarOutlineAndLabelColors[authorLabel];

  const avatarSize = () => {
    let size = '2rem';
    if (post.type !== ThreadType.QUESTION && !fromPostLink) {
      size = '2.375rem';
    } else if (post.type === ThreadType.QUESTION) {
      size = '1.5rem';
    }
    return size;
  };

  return (
    <div className={`mr-3
      ${post.type !== ThreadType.QUESTION && fromPostLink ? 'pt-1.5' : 'ml-0.5 mt-0.5'}`}
    >
      {post.type === ThreadType.QUESTION && (
        <Icon
          src={Question}
          className="position-absolute bg-white rounded-circle"
          style={{
            width: '1.75rem',
            height: '1.75rem',
            top: fromPostLink ? '10px' : '',
            left: fromPostLink ? '14px' : '',
          }}
        />
      )}
      <Avatar
        className={`border-0 ${outlineColor ? `outline-${outlineColor}` : 'outline-anonymous'}
         ${post.type === ThreadType.QUESTION && fromPostLink ? 'mt-3 ml-2' : ''}
        `}
        style={{
          height: avatarSize(),
          width: avatarSize(),
          marginTop: post.type === ThreadType.QUESTION ? '16px' : '',
          marginLeft: post.type === ThreadType.QUESTION ? '18px' : '',
        }}
        alt={post.author}
        src={authorAvatars?.imageUrlSmall}
      />
    </div>
  );
}

PostAvatar.propTypes = {
  post: postShape.isRequired,
  authorLabel: PropTypes.string,
  fromPostLink: PropTypes.bool,
};

PostAvatar.defaultProps = {
  authorLabel: null,
  fromPostLink: false,
};

function PostHeader({
  intl,
  post,
  preview,
  actionHandlers,
}) {
  const showAnsweredBadge = preview && post.hasEndorsed && post.type === ThreadType.QUESTION;
  const authorLabelColor = AvatarOutlineAndLabelColors[post.authorLabel];
  return (
    <div className="d-flex flex-fill mw-100" style={{ height: '2.625rem' }}>
      <PostAvatar post={post} authorLabel={post.authorLabel} />
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
            : <h4 className="mb-0" style={{ lineHeight: '28px' }} aria-level="1">{post.title}</h4>}
          <AuthorLabel
            author={post.author || intl.formatMessage(messages.anonymous)}
            authorLabel={post.authorLabel}
            labelColor={authorLabelColor && `text-${authorLabelColor}`}
          />
        </div>
      </div>
      {!preview
        && (
          <div className="ml-auto d-flex align-items-center">
            <ActionsDropdown commentOrPost={post} actionHandlers={actionHandlers} />
          </div>
        )}
    </div>
  );
}

PostHeader.propTypes = {
  intl: intlShape.isRequired,
  post: postShape.isRequired,
  preview: PropTypes.bool,
  actionHandlers: PropTypes.objectOf(PropTypes.func).isRequired,
};

PostHeader.defaultProps = {
  preview: false,
};

export default injectIntl(PostHeader);
