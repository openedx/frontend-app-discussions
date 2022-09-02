import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';
import * as timeago from 'timeago.js';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Avatar, useToggle } from '@edx/paragon';

import HTMLLoader from '../../../components/HTMLLoader';
import { AvatarOutlineAndLabelColors, ContentActions } from '../../../data/constants';
import {
  ActionsDropdown, AlertBanner, AuthorLabel, DeleteConfirmation,
} from '../../common';
import timeLocale from '../../common/time-locale';
import { useAlertBannerVisible } from '../../data/hooks';
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
  timeago.register('time-locale', timeLocale);
  const dispatch = useDispatch();
  const [isEditing, setEditing] = useState(false);
  const [isDeleting, showDeleteConfirmation, hideDeleteConfirmation] = useToggle(false);
  const actionHandlers = {
    [ContentActions.EDIT_CONTENT]: () => setEditing(true),
    [ContentActions.ENDORSE]: () => dispatch(editComment(
      reply.id,
      { endorsed: !reply.endorsed },
      ContentActions.ENDORSE,
    )),
    [ContentActions.DELETE]: showDeleteConfirmation,
    [ContentActions.REPORT]: () => dispatch(editComment(reply.id, { flagged: !reply.abuseFlagged })),
  };
  const authorAvatars = useSelector(selectAuthorAvatars(reply.author));
  const colorClass = AvatarOutlineAndLabelColors[reply.authorLabel];
  const hasAnyAlert = useAlertBannerVisible(reply);

  return (
    <div className="d-flex flex-column mt-4.5" data-testid={`reply-${reply.id}`} role="listitem">
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

      {hasAnyAlert && (
        <div className="d-flex">
          <div className="d-flex invisible">
            <Avatar />
          </div>
          <div className="w-100">
            <AlertBanner content={reply} intl={intl} />
          </div>
        </div>
      )}

      <div className="d-flex">
        <div className="d-flex mr-3 mt-2.5">
          <Avatar
            className={`ml-0.5 mt-0.5 border-0 ${colorClass ? `outline-${colorClass}` : 'outline-anonymous'}`}
            alt={reply.author}
            src={authorAvatars?.imageUrlSmall}
            style={{
              width: '32px',
              height: '32px',
            }}
          />
        </div>
        <div
          className="bg-light-300 px-4 pb-2 pt-2.5 flex-fill"
          style={{ borderRadius: '0rem 0.375rem 0.375rem' }}
        >
          <div className="d-flex flex-row justify-content-between align-items-center mb-0.5">
            <AuthorLabel author={reply.author} authorLabel={reply.authorLabel} labelColor={colorClass && `text-${colorClass}`} linkToProfile />
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
            : <HTMLLoader componentId="reply" htmlNode={reply.renderedBody} cssClassName="text-primary-500" />}
        </div>
      </div>
      <div className="text-gray-500 align-self-end mt-2" title={reply.createdAt}>
        {timeago.format(reply.createdAt, 'time-locale')}
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
