import React, { useContext, useRef } from 'react';
import PropTypes from 'prop-types';

import { Formik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { Button, Form, StatefulButton } from '@edx/paragon';

import { TinyMCEEditor } from '../../../components';
import { useDispatchWithState } from '../../../data/hooks';
import { selectModerationSettings, selectUserIsPrivileged } from '../../data/selectors';
import { formikCompatibleHandler, isFormikFieldInvalid } from '../../utils';
import { addComment, editComment } from '../data/thunks';
import messages from '../messages';

function CommentEditor({
  intl,
  comment,
  onCloseEditor,
}) {
  const { authenticatedUser } = useContext(AppContext);
  const userIsPrivileged = useSelector(selectUserIsPrivileged);
  const { reasonCodesEnabled, editReasons } = useSelector(selectModerationSettings);
  const [submitting, dispatch] = useDispatchWithState();
  const editorRef = useRef(null);
  const saveUpdatedComment = async (values) => {
    if (comment.id) {
      await dispatch(editComment(comment.id, values));
    } else {
      await dispatch(addComment(values.comment, comment.threadId, comment.parentId));
    }
    /* istanbul ignore if: TinyMCE is mocked so this cannot be easily tested */
    if (editorRef.current) {
      editorRef.current.plugins.autosave.removeDraft();
    }
    onCloseEditor();
  };
  // The editorId is used to autosave contents to localstorage. This format means that the autosave is scoped to
  // the current comment id, or the current comment parent or the curren thread.
  const editorId = `comment-editor-${comment.id || comment.parentId || comment.threadId}`;
  return (
    <Formik
      initialValues={{ comment: comment.rawBody }}
      validationSchema={Yup.object()
        .shape({
          comment: Yup.string()
            .required(),
          editReasonCode: Yup.string()
            .nullable()
            .default(null),
        })}
      onSubmit={saveUpdatedComment}
    >
      {({
        values,
        errors,
        touched,
        handleSubmit,
        handleBlur,
        handleChange,
      }) => (
        <Form onSubmit={handleSubmit}>
          {(reasonCodesEnabled
            && userIsPrivileged
            && comment.author !== authenticatedUser.username) && (
            <Form.Group>
              <Form.Control
                name="editReasonCode"
                className="mt-2"
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
          <div className="d-flex py-2 justify-content-end">
            <Button
              variant="outline-primary"
              onClick={onCloseEditor}
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
    id: PropTypes.string,
    threadId: PropTypes.string.isRequired,
    parentId: PropTypes.string,
    rawBody: PropTypes.string,
    author: PropTypes.string,
  }).isRequired,
  onCloseEditor: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(CommentEditor);
