import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { useDispatch } from 'react-redux';
import * as timeago from 'timeago.js';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Avatar, useToggle } from '@edx/paragon';

import HTMLLoader from '../../../../components/HTMLLoader';
import { AvatarOutlineAndLabelColors, ContentActions } from '../../../../data/constants';
import {
  ActionsDropdown, AlertBanner, AuthorLabel, Confirmation,
} from '../../../common';
import timeLocale from '../../../common/time-locale';
import { useAlertBannerVisible } from '../../../data/hooks';
import { editComment, removeComment } from '../../data/thunks';
import messages from '../../messages';
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
  const [isReporting, showReportConfirmation, hideReportConfirmation] = useToggle(false);

  const handleAbusedFlag = useCallback(() => {
    if (reply.abuseFlagged) {
      dispatch(editComment(reply.id, { flagged: !reply.abuseFlagged }));
    } else {
      showReportConfirmation();
    }
  }, [dispatch, reply.abuseFlagged, reply.id, showReportConfirmation]);

  const handleDeleteConfirmation = () => {
    dispatch(removeComment(reply.id));
    hideDeleteConfirmation();
  };

  const handleReportConfirmation = () => {
    dispatch(editComment(reply.id, { flagged: !reply.abuseFlagged }));
    hideReportConfirmation();
  };

  const actionHandlers = useMemo(() => ({
    [ContentActions.EDIT_CONTENT]: () => setEditing(true),
    [ContentActions.ENDORSE]: () => dispatch(editComment(
      reply.id,
      { endorsed: !reply.endorsed },
      ContentActions.ENDORSE,
    )),
    [ContentActions.DELETE]: showDeleteConfirmation,
    [ContentActions.REPORT]: () => handleAbusedFlag(),
  }), [dispatch, handleAbusedFlag, reply.endorsed, reply.id, showDeleteConfirmation]);

  const colorClass = AvatarOutlineAndLabelColors[reply.authorLabel];
  const hasAnyAlert = useAlertBannerVisible({
    author: reply.author,
    abuseFlagged: reply.abuseFlagged,
    lastEdit: reply.lastEdit,
    closed: reply.closed,
  });

  return (
    <div className="d-flex flex-column mt-2.5 " data-testid={`reply-${reply.id}`} role="listitem">
      <Confirmation
        isOpen={isDeleting}
        title={intl.formatMessage(messages.deleteCommentTitle)}
        description={intl.formatMessage(messages.deleteCommentDescription)}
        onClose={hideDeleteConfirmation}
        comfirmAction={handleDeleteConfirmation}
        closeButtonVaraint="tertiary"
        confirmButtonText={intl.formatMessage(messages.deleteConfirmationDelete)}
      />
      {!reply.abuseFlagged && (
        <Confirmation
          isOpen={isReporting}
          title={intl.formatMessage(messages.reportCommentTitle)}
          description={intl.formatMessage(messages.reportCommentDescription)}
          onClose={hideReportConfirmation}
          comfirmAction={handleReportConfirmation}
          confirmButtonVariant="danger"
        />
      )}
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
            style={{
              width: '32px',
              height: '32px',
            }}
          />
        </div>
        <div
          className="bg-light-300 pl-4 pt-2.5 pr-2.5 pb-10px flex-fill"
          style={{ borderRadius: '0rem 0.375rem 0.375rem' }}
        >
          <div className="d-flex flex-row justify-content-between" style={{ height: '24px' }}>
            <AuthorLabel
              author={reply.author}
              authorLabel={reply.authorLabel}
              labelColor={colorClass && `text-${colorClass}`}
              linkToProfile
              postCreatedAt={reply.createdAt}
              postOrComment
            />
            <div className="ml-auto d-flex">
              <ActionsDropdown
                commentOrPost={{
                  ...reply,
                  postType,
                }}
                actionHandlers={actionHandlers}
                iconSize="inline"
              />
            </div>
          </div>
          {isEditing
            ? <CommentEditor comment={reply} onCloseEditor={() => setEditing(false)} />
            : (
              <HTMLLoader
                componentId="reply"
                htmlNode={reply.renderedBody}
                cssClassName="html-loader text-break font-style text-primary-500"
                testId={reply.id}
              />
            )}
        </div>
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
