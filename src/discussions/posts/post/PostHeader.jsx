import React from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Avatar, Badge, Icon } from '@edx/paragon';
import { Help } from '@edx/paragon/icons';

import { ThreadType } from '../../../data/constants';
import ActionsDropdown from '../../common/ActionsDropdown';
import { selectAuthorAvatars } from '../data/selectors';
import messages from './messages';
import { postShape } from './proptypes';

function PostHeader({
  intl,
  post,
  preview,
  actionHandlers,
}) {
  const authorAvatars = useSelector(selectAuthorAvatars(post.author));

  return (
    <div className="d-flex flex-fill">
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
      <div className="align-items-center d-flex flex-row flex-fill">
        <div className="d-flex flex-column flex-fill justify-content-start">
          {preview
            ? (
              <div className="h4 d-flex align-items-center">
                <span className="flex-fill">
                  {post.title}
                </span>
                {preview && post.hasEndorsed && post.type === ThreadType.QUESTION
                && <Badge variant="success">{intl.formatMessage(messages.answered)}</Badge>}
              </div>
            )
            : <h3>{post.title}</h3>}
        </div>
      </div>
      {!preview && <ActionsDropdown commentOrPost={post} actionHandlers={actionHandlers} />}
    </div>
  );
}

PostHeader.propTypes = {
  intl: intlShape.isRequired,
  post: postShape.isRequired,
  preview: PropTypes.bool.isRequired,
  actionHandlers: PropTypes.objectOf(PropTypes.func).isRequired,
};

export default injectIntl(PostHeader);
