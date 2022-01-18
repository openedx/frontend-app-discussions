import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';
import * as timeago from 'timeago.js';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Avatar, useToggle } from '@edx/paragon';

import { ContentActions } from '../../../data/constants';
import { DeleteConfirmation } from '../../common';
import ActionsDropdown from '../../common/ActionsDropdown';
import AlertBanner from '../../common/AlertBanner';
import AuthorLabel from '../../common/AuthorLabel';
import { selectAuthorAvatars } from '../../posts/data/selectors';
import { editComment, removeComment } from '../data/thunks';
import messages from '../messages';
import CommentEditor from './CommentEditor';
import { commentShape } from './proptypes';

function Reply({
  reply,
  postType,
  intl,
}) {
  const dispatch = useDispatch();
  const [isEditing, setEditing] = useState(false);
  const [isDeleting, showDeleteConfirmation, hideDeleteConfirmation] = useToggle(false);
  const actionHandlers = {
    [ContentActions.EDIT_CONTENT]: () => setEditing(true),
    [ContentActions.ENDORSE]: () => dispatch(editComment(reply.id, { endorsed: !reply.endorsed })),
    [ContentActions.DELETE]: showDeleteConfirmation,
    [ContentActions.REPORT]: () => dispatch(editComment(reply.id, { flagged: !reply.abuseFlagged })),
  };
  const authorAvatars = useSelector(selectAuthorAvatars(reply.author));
  return (
    <div className="d-flex my-2 flex-column" data-testid={`reply-${reply.id}`}>
      <DeleteConfirmation
        isOpen={isDeleting}
        title={intl.formatMessage(messages.deleteCommentTitle)}
        description={intl.formatMessage(messages.deleteCommentDescription)}
        onClose={hideDeleteConfirmation}
        onDelete={() => {
          dispatch(removeComment(reply.id));
          hideDeleteConfirmation();
        }}
      />
      <div className="d-flex flex-fill ml-6">
        <AlertBanner postType={null} content={reply} intl={intl} />
      </div>
      <div className="d-flex">

        <div className="d-flex m-3">
          <Avatar alt={reply.author} src={authorAvatars?.imageUrlSmall} />
        </div>
        <div className="rounded bg-light-300 px-4 py-2 flex-fill">
          <div className="d-flex flex-row justify-content-between align-items-center">
            <AuthorLabel author={reply.author} authorLabel={reply.authorLabel} />
            <ActionsDropdown
              commentOrPost={{
                ...reply,
                postType,
              }}
              actionHandlers={actionHandlers}
            />
          </div>
          {isEditing
            ? <CommentEditor comment={reply} onCloseEditor={() => setEditing(false)} />
            // eslint-disable-next-line react/no-danger
            : <div dangerouslySetInnerHTML={{ __html: reply.renderedBody }} />}
        </div>

      </div>
      <div className="text-gray-500 align-self-end mt-2" title={reply.createdAt}>
        {timeago.format(reply.createdAt, intl.locale)}
      </div>
    </div>
  );
}
Reply.propTypes = {
  postType: PropTypes.oneOf(['discussion', 'question']).isRequired,
  reply: commentShape.isRequired,
  intl: intlShape.isRequired,
};
export default injectIntl(Reply);
