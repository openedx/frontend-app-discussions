import React from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';

import { injectIntl } from '@edx/frontend-platform/i18n';
import { Avatar } from '@edx/paragon';

import { ThreadType } from '../../../data/constants';
import { AuthorLabel } from '../../common';
import ActionsDropdown from '../../common/ActionsDropdown';
import { selectAuthorAvatars } from '../../posts/data/selectors';
import { commentShape } from './proptypes';

function CommentHeader({
  comment,
  postType,
  actionHandlers,
}) {
  const authorAvatars = useSelector(selectAuthorAvatars(comment.author));
  return (
    <div className="d-flex flex-row justify-content-between">
      <div className="align-items-center d-flex flex-row">
        <Avatar className="m-2" alt={comment.author} src={authorAvatars?.imageUrlSmall} />
        <AuthorLabel author={comment.author} authorLabel={comment.authorLabel} />
      </div>
      <ActionsDropdown
        commentOrPost={{
          ...comment,
          postType,
        }}
        actionHandlers={actionHandlers}
      />
    </div>
  );
}

CommentHeader.propTypes = {
  comment: commentShape.isRequired,
  actionHandlers: PropTypes.objectOf(PropTypes.func).isRequired,
  postType: PropTypes.oneOf([ThreadType.QUESTION, ThreadType.DISCUSSION]).isRequired,
};

export default injectIntl(CommentHeader);
