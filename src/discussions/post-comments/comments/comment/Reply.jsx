import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { Avatar, useToggle } from '@openedx/paragon';
import { useDispatch, useSelector } from 'react-redux';
import * as timeago from 'timeago.js';

import { useIntl } from '@edx/frontend-platform/i18n';

import HTMLLoader from '../../../../components/HTMLLoader';
import { AvatarOutlineAndLabelColors, ContentActions } from '../../../../data/constants';
import {
  ActionsDropdown, AlertBanner, AuthorLabel, Confirmation,
} from '../../../common';
import timeLocale from '../../../common/time-locale';
import { ContentTypes } from '../../../data/constants';
import { useAlertBannerVisible } from '../../../data/hooks';
import { selectCommentOrResponseById } from '../../data/selectors';
import { editComment, removeComment } from '../../data/thunks';
import messages from '../../messages';
import CommentEditor from './CommentEditor';

const Reply = ({ responseId }) => {
  timeago.register('time-locale', timeLocale);
  const {
    id, abuseFlagged, author, authorLabel, endorsed, lastEdit, closed, closedBy,
    closeReason, createdAt, threadId, parentId, rawBody, renderedBody, editByLabel, closedByLabel,
  } = useSelector(selectCommentOrResponseById(responseId));
  const intl = useIntl();
  const dispatch = useDispatch();
  const [isEditing, setEditing] = useState(false);
  const [isDeleting, showDeleteConfirmation, hideDeleteConfirmation] = useToggle(false);
  const [isReporting, showReportConfirmation, hideReportConfirmation] = useToggle(false);
  const colorClass = AvatarOutlineAndLabelColors[authorLabel];
  const hasAnyAlert = useAlertBannerVisible({
    author,
    abuseFlagged,
    lastEdit,
    closed,
  });

  const handleDeleteConfirmation = useCallback(() => {
    dispatch(removeComment(id));
    hideDeleteConfirmation();
  }, [id, hideDeleteConfirmation]);

  const handleReportConfirmation = useCallback(() => {
    dispatch(editComment(id, { flagged: !abuseFlagged }));
    hideReportConfirmation();
  }, [abuseFlagged, id, hideReportConfirmation]);

  const handleEditContent = useCallback(() => {
    setEditing(true);
  }, []);

  const handleReplyEndorse = useCallback(() => {
    dispatch(editComment(id, { endorsed: !endorsed }));
  }, [endorsed, id]);

  const handleAbusedFlag = useCallback(() => {
    if (abuseFlagged) {
      dispatch(editComment(id, { flagged: !abuseFlagged }));
    } else {
      showReportConfirmation();
    }
  }, [abuseFlagged, id, showReportConfirmation]);

  const handleCloseEditor = useCallback(() => {
    setEditing(false);
  }, []);

  const actionHandlers = useMemo(() => ({
    [ContentActions.EDIT_CONTENT]: handleEditContent,
    [ContentActions.ENDORSE]: handleReplyEndorse,
    [ContentActions.DELETE]: showDeleteConfirmation,
    [ContentActions.REPORT]: handleAbusedFlag,
  }), [handleEditContent, handleReplyEndorse, showDeleteConfirmation, handleAbusedFlag]);

  return (
    <div className="d-flex flex-column mt-2.5 " data-testid={`reply-${id}`} role="listitem">
      <Confirmation
        isOpen={isDeleting}
        title={intl.formatMessage(messages.deleteCommentTitle)}
        description={intl.formatMessage(messages.deleteCommentDescription)}
        onClose={hideDeleteConfirmation}
        confirmAction={handleDeleteConfirmation}
        closeButtonVariant="tertiary"
        confirmButtonText={intl.formatMessage(messages.deleteConfirmationDelete)}
      />
      {!abuseFlagged && (
        <Confirmation
          isOpen={isReporting}
          title={intl.formatMessage(messages.reportCommentTitle)}
          description={intl.formatMessage(messages.reportCommentDescription)}
          onClose={hideReportConfirmation}
          confirmAction={handleReportConfirmation}
          confirmButtonVariant="danger"
        />
      )}
      {hasAnyAlert && (
        <div className="d-flex">
          <div className="d-flex invisible">
            <Avatar />
          </div>
          <div className="w-100">
            <AlertBanner
              author={author}
              abuseFlagged={abuseFlagged}
              closed={closed}
              closedBy={closedBy}
              closeReason={closeReason}
              lastEdit={lastEdit}
              editByLabel={editByLabel}
              closedByLabel={closedByLabel}
            />
          </div>
        </div>
      )}
      <div className="d-flex">
        <div className="d-flex mr-3 mt-2.5">
          <Avatar
            className={`ml-0.5 mt-0.5 border-0 ${colorClass ? `outline-${colorClass}` : 'outline-anonymous'}`}
            alt={author}
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
          <div className="d-flex flex-row justify-content-between">
            <AuthorLabel
              author={author}
              authorLabel={authorLabel}
              labelColor={colorClass && `text-${colorClass}`}
              linkToProfile
              postCreatedAt={createdAt}
              postOrComment
            />
            <div className="ml-auto d-flex">
              <ActionsDropdown
                actionHandlers={actionHandlers}
                contentType={ContentTypes.COMMENT}
                iconSize="inline"
                id={id}
              />
            </div>
          </div>
          {isEditing ? (
            <CommentEditor
              comment={{
                id,
                threadId,
                parentId,
                rawBody,
                author,
                lastEdit,
              }}
              onCloseEditor={handleCloseEditor}
            />
          ) : (
            <HTMLLoader
              componentId="reply"
              htmlNode={renderedBody}
              cssClassName="html-loader text-break font-style text-primary-500"
              testId={id}
            />
          )}
        </div>
      </div>
    </div>
  );
};

Reply.propTypes = {
  responseId: PropTypes.string.isRequired,
};

export default React.memo(Reply);
