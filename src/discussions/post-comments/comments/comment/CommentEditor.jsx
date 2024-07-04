import React, {
  useCallback, useContext, useEffect, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';

import { Button, Form, StatefulButton } from '@openedx/paragon';
import { Formik } from 'formik';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';

import { useIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';

import { TinyMCEEditor } from '../../../../components';
import FormikErrorFeedback from '../../../../components/FormikErrorFeedback';
import PostPreviewPanel from '../../../../components/PostPreviewPanel';
import useDispatchWithState from '../../../../data/hooks';
import DiscussionContext from '../../../common/context';
import {
  selectDraft,
  selectModerationSettings,
  selectUserHasModerationPrivileges,
  selectUserIsGroupTa,
  selectUserIsStaff,
} from '../../../data/selectors';
import { formikCompatibleHandler, isFormikFieldInvalid } from '../../../utils';
import { useAddDraftContent, useRemoveDraftContent } from '../../data/hooks';
import { setDraftContent } from '../../data/slices';
import { addComment, editComment } from '../../data/thunks';
import messages from '../../messages';

const CommentEditor = ({
  comment,
  edit,
  formClasses,
  onCloseEditor,
}) => {
  const {
    id, threadId, parentId, rawBody, author, lastEdit,
  } = comment;
  const intl = useIntl();
  const editorRef = useRef(null);
  const formRef = useRef(null);
  const { authenticatedUser } = useContext(AppContext);
  const { enableInContextSidebar } = useContext(DiscussionContext);
  const userHasModerationPrivileges = useSelector(selectUserHasModerationPrivileges);
  const userIsGroupTa = useSelector(selectUserIsGroupTa);
  const userIsStaff = useSelector(selectUserIsStaff);
  const { editReasons } = useSelector(selectModerationSettings);
  const { responses, comments } = useSelector(selectDraft);
  const [submitting, dispatch] = useDispatchWithState();
  const [editorContent, setEditorContent] = useState();

  const canDisplayEditReason = (edit
    && (userHasModerationPrivileges || userIsGroupTa || userIsStaff)
    && author !== authenticatedUser.username
  );

  const editReasonCodeValidation = canDisplayEditReason && {
    editReasonCode: Yup.string().required(intl.formatMessage(messages.editReasonCodeError)),
  };

  const validationSchema = Yup.object().shape({
    comment: Yup.string()
      .required(),
    ...editReasonCodeValidation,
  });

  const initialValues = {
    comment: rawBody,
    editReasonCode: lastEdit?.reasonCode || (userIsStaff && canDisplayEditReason ? 'violates-guidelines' : undefined),
  };

  const handleCloseEditor = useCallback((resetForm) => {
    resetForm({ values: initialValues });
    onCloseEditor();
  }, [onCloseEditor, initialValues]);

  const DeleteEditorContent = async () => {
    const { updatedResponses, updatedComments } = useRemoveDraftContent(responses, comments, parentId, id, threadId);
    await dispatch(setDraftContent({ responses: updatedResponses, comments: updatedComments }));
  };

  const saveUpdatedComment = useCallback(async (values, { resetForm }) => {
    const clonedValues = { ...values };
    clonedValues.comment = editorContent;
    if (id) {
      const payload = {
        ...clonedValues,
        editReasonCode: clonedValues.editReasonCode || undefined,
      };
      await dispatch(editComment(id, payload));
    } else {
      await dispatch(addComment(clonedValues.comment, threadId, parentId, enableInContextSidebar));
    }
    /* istanbul ignore if: TinyMCE is mocked so this cannot be easily tested */
    if (editorRef.current) {
      editorRef.current.plugins.autosave.removeDraft();
    }
    handleCloseEditor(resetForm);
    DeleteEditorContent();
  }, [id, threadId, parentId, enableInContextSidebar, handleCloseEditor]);
  // The editorId is used to autosave contents to localstorage. This format means that the autosave is scoped to
  // the current comment id, or the current comment parent or the curren thread.
  const editorId = `comment-editor-${id || parentId || threadId}`;

  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [formRef]);

  useEffect(() => {
    const draftObject = parentId
      ? comments.find(x => x.parentId === parentId && x.id === id)
      : responses.find(x => x.threadId === threadId && x.id === id);

    setEditorContent(draftObject ? draftObject.content : '');
  }, [responses, comments, parentId, threadId, id]);

  const SaveDraftComment = async () => {
    const content = editorRef.current.getContent();
    const { updatedResponses, updatedComments } = useAddDraftContent(
      content,
      responses,
      comments,
      parentId,
      id,
      threadId,
    );
    await dispatch(setDraftContent({ responses: updatedResponses, comments: updatedComments }));
  };

  const handleEditorChange = (content, setFieldValue) => {
    setEditorContent(content);
    setFieldValue('comment', content);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={saveUpdatedComment}
    >
      {({
        values,
        errors,
        touched,
        handleSubmit,
        handleBlur,
        handleChange,
        resetForm,
        setFieldValue,
      }) => (
        <Form onSubmit={handleSubmit} className={formClasses} ref={formRef}>
          {canDisplayEditReason && (
            <Form.Group
              isInvalid={isFormikFieldInvalid('editReasonCode', {
                errors,
                touched,
              })}
            >
              <Form.Control
                name="editReasonCode"
                className="mt-2 mr-0"
                as="select"
                value={values.editReasonCode}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-describedby="editReasonCodeInput"
                floatingLabel={intl.formatMessage(messages.editReasonCode)}
              >
                <option key="empty" value="">---</option>
                {editReasons.map(({
                  code,
                  label,
                }) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </Form.Control>
              <FormikErrorFeedback name="editReasonCode" />
            </Form.Group>
          )}
          <TinyMCEEditor
            onInit={
              /* istanbul ignore next: TinyMCE is mocked so this cannot be easily tested */
              (_, editor) => {
                editorRef.current = editor;
              }
            }
            id={editorId}
            value={editorContent || values.comment}
            onEditorChange={(content) => handleEditorChange(content, setFieldValue)}
            onBlur={() => {
              formikCompatibleHandler(handleChange, 'comment');
              SaveDraftComment();
            }}
          />
          {isFormikFieldInvalid('comment', {
            errors,
            touched,
          })
            && (
              <Form.Control.Feedback type="invalid" hasIcon={false}>
                {intl.formatMessage(messages.commentError)}
              </Form.Control.Feedback>
            )}
          <PostPreviewPanel htmlNode={values.comment} />
          <div className="d-flex py-2 justify-content-end">
            <Button
              variant="outline-primary"
              onClick={() => handleCloseEditor(resetForm)}
            >
              {intl.formatMessage(messages.cancel)}
            </Button>
            <StatefulButton
              state={submitting ? 'pending' : null}
              labels={{
                default: intl.formatMessage(messages.submit),
                pending: intl.formatMessage(messages.submitting),
              }}
              className="ml-2"
              variant="primary"
              onClick={handleSubmit}
            />
          </div>
        </Form>
      )}
    </Formik>
  );
};

CommentEditor.propTypes = {
  comment: PropTypes.shape({
    author: PropTypes.string,
    id: PropTypes.string,
    lastEdit: PropTypes.shape({
      reasonCode: PropTypes.shape({}),
    }),
    parentId: PropTypes.string,
    rawBody: PropTypes.string,
    threadId: PropTypes.string.isRequired,
  }),
  edit: PropTypes.bool,
  formClasses: PropTypes.string,
  onCloseEditor: PropTypes.func.isRequired,
};

CommentEditor.defaultProps = {
  edit: true,
  comment: {
    author: null,
    id: null,
    lastEdit: null,
    parentId: null,
    rawBody: '',
  },
  formClasses: '',
};

export default React.memo(CommentEditor);
