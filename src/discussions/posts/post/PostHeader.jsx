import React from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Avatar, Badge, Icon } from '@edx/paragon';
import { Help } from '@edx/paragon/icons';

import { ThreadType } from '../../../data/constants';
import { ActionsDropdown, AuthorLabel } from '../../common';
import { selectAuthorAvatars } from '../data/selectors';
import messages from './messages';
import { postShape } from './proptypes';

export function PostAvatar({ post }) {
  const authorAvatars = useSelector(selectAuthorAvatars(post.author));
  return (
    <div className="mr-2">
      {post.type === ThreadType.QUESTION && (
      <Icon
        src={Help}
        className="position-absolute bg-white rounded-circle"
        style={{
          width: '1.75rem',
          height: '1.75rem',
        }}
      />
      )}
      <Avatar
        size={post.type === ThreadType.QUESTION ? 'sm' : 'md'}
        className={post.type === ThreadType.QUESTION ? 'mt-2.5 ml-2.5' : ''}
        alt={post.author}
        src={authorAvatars?.imageUrlSmall}
      />
    </div>
  );
}

PostAvatar.propTypes = {
  post: postShape.isRequired,
};

function PostHeader({
  intl,
  post,
  preview,
  actionHandlers,
}) {
  const showAnsweredBadge = preview && post.hasEndorsed && post.type === ThreadType.QUESTION;

  return (
    <div className="d-flex flex-fill mw-100">
      <PostAvatar post={post} />
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
            : <h3 className="mb-0">{post.title}</h3>}
          <AuthorLabel author={post.author || intl.formatMessage(messages.anonymous)} authorLabel={post.authorLabel} />
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
