import React from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Avatar, Badge, Icon } from '@edx/paragon';

import { Question } from '../../../components/icons';
import { AvatarBorderAndLabelColors, ThreadType } from '../../../data/constants';
import { ActionsDropdown, AuthorLabel } from '../../common';
import { selectAuthorAvatars } from '../data/selectors';
import messages from './messages';
import { postShape } from './proptypes';

export function PostAvatar({ post, authorLabel, fromPostLink }) {
  const authorAvatars = useSelector(selectAuthorAvatars(post.author));
  const borderColor = AvatarBorderAndLabelColors[authorLabel];

  return (
    <div className={`mr-3 ${post.type !== ThreadType.QUESTION && 'pt-1.5'}`}>
      {post.type === ThreadType.QUESTION && (
        <Icon
          src={Question}
          className="position-absolute bg-white rounded-circle"
          style={{
            width: '1.75rem',
            height: '1.75rem',
            top: fromPostLink ? '10px' : '',
            left: fromPostLink ? '14px' : '',
            marginTop: !fromPostLink ? '5px' : '',
          }}
        />
      )}
      <Avatar
        size={fromPostLink ? 'sm' : 'md'}
        className={`${borderColor && `border-${borderColor}`}
         ${post.type === ThreadType.QUESTION && fromPostLink ? 'mt-3 ml-2' : ''}
        `}
        style={{
          borderWidth: '2px',
          height: post.type === ThreadType.QUESTION ? '1.5rem' : '2rem',
          width: post.type === ThreadType.QUESTION ? '1.5rem' : '2rem',
          marginTop: post.type === ThreadType.QUESTION ? '22px' : '',
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
  const authorLabelColor = AvatarBorderAndLabelColors[post.authorLabel];
  return (
    <div className="d-flex flex-fill mw-100">
      <PostAvatar post={post} authorLabel={post.authorLabel} />
      <div className="align-items-center d-flex flex-row" style={{ width: 'calc(100% - 8rem)' }}>
        <div className="d-flex flex-column justify-content-start mw-100">
          {preview
            ? (
              <div className="h4 d-flex align-items-center pb-0 mb-0 flex-fill">
                <div className="flex-fill text-truncate">
                  {post.title}
                </div>
                {showAnsweredBadge
                  && <Badge variant="success">{intl.formatMessage(messages.answered)}</Badge>}
              </div>
            )
            : <h3 className="mb-0" aria-level="1">{post.title}</h3>}
          <AuthorLabel
            author={post.author || intl.formatMessage(messages.anonymous)}
            authorLabel={post.authorLabel}
            labelColor={authorLabelColor && `text-${authorLabelColor}`}
          />
        </div>
      </div>
      {!preview
        && (
          <div className="ml-auto">
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
