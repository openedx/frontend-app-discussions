import React, { useRef } from 'react';
import PropTypes from 'prop-types';

import { Formik } from 'formik';
import * as Yup from 'yup';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, Form, StatefulButton } from '@edx/paragon';

import { TinyMCEEditor } from '../../../components';
import { useDispatchWithState } from '../../../data/hooks';
import { formikCompatibleHandler, isFormikFieldInvalid } from '../../utils';
import { addComment, editComment } from '../data/thunks';
import messages from '../messages';

function CommentEditor({
  intl,
  comment,
  onCloseEditor,
}) {
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
  }).isRequired,
  onCloseEditor: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(CommentEditor);
