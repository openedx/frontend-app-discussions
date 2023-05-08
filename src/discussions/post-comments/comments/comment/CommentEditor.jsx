import React, { useCallback, useContext, useRef } from 'react';
import PropTypes from 'prop-types';

import { Formik } from 'formik';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';

import { useIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { Button, Form, StatefulButton } from '@edx/paragon';

import { TinyMCEEditor } from '../../../../components';
import FormikErrorFeedback from '../../../../components/FormikErrorFeedback';
import PostPreviewPanel from '../../../../components/PostPreviewPanel';
import { useDispatchWithState } from '../../../../data/hooks';
import { DiscussionContext } from '../../../common/context';
import {
  selectModerationSettings,
  selectUserHasModerationPrivileges,
  selectUserIsGroupTa,
  selectUserIsStaff,
} from '../../../data/selectors';
import { formikCompatibleHandler, isFormikFieldInvalid } from '../../../utils';
import { addComment, editComment } from '../../data/thunks';
import messages from '../../messages';

function CommentEditor({
  comment,
  edit,
  formClasses,
  onCloseEditor,
}) {
  const {
    id, threadId, parentId, rawBody, author, lastEdit,
  } = comment;
  const intl = useIntl();
  const editorRef = useRef(null);
  const { authenticatedUser } = useContext(AppContext);
  const { enableInContextSidebar } = useContext(DiscussionContext);
  const userHasModerationPrivileges = useSelector(selectUserHasModerationPrivileges);
  const userIsGroupTa = useSelector(selectUserIsGroupTa);
  const userIsStaff = useSelector(selectUserIsStaff);
  const { reasonCodesEnabled, editReasons } = useSelector(selectModerationSettings);
  const [submitting, dispatch] = useDispatchWithState();

  const canDisplayEditReason = (reasonCodesEnabled && edit
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
    editReasonCode: lastEdit?.reasonCode || (userIsStaff ? 'violates-guidelines' : ''),
  };

  const handleCloseEditor = useCallback((resetForm) => {
    resetForm({ values: initialValues });
    onCloseEditor();
  }, [onCloseEditor, initialValues]);

  const saveUpdatedComment = useCallback(async (values, { resetForm }) => {
    if (id) {
      const payload = {
        ...values,
        editReasonCode: values.editReasonCode || undefined,
      };
      await dispatch(editComment(id, payload));
    } else {
      await dispatch(addComment(values.comment, threadId, parentId, enableInContextSidebar));
    }
    /* istanbul ignore if: TinyMCE is mocked so this cannot be easily tested */
    if (editorRef.current) {
      editorRef.current.plugins.autosave.removeDraft();
    }
    handleCloseEditor(resetForm);
  }, [id, threadId, parentId, enableInContextSidebar, handleCloseEditor]);
  // The editorId is used to autosave contents to localstorage. This format means that the autosave is scoped to
  // the current comment id, or the current comment parent or the curren thread.
  const editorId = `comment-editor-${id || parentId || threadId}`;

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
      }) => (
        <Form onSubmit={handleSubmit} className={formClasses}>
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
            value={values.comment}
            onEditorChange={formikCompatibleHandler(handleChange, 'comment')}
            onBlur={formikCompatibleHandler(handleBlur, 'comment')}
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
}

CommentEditor.propTypes = {
  comment: PropTypes.shape({
    author: PropTypes.string,
    id: PropTypes.string,
    lastEdit: PropTypes.object,
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
