import React from 'react';
import PropTypes from 'prop-types';

import { Formik } from 'formik';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Form, StatefulButton } from '@edx/paragon';

import { TinyMCEEditor } from '../../../components';
import { formikCompatibleHandler, isFormikFieldInvalid } from '../../utils';
import { addComment, editComment } from '../data/thunks';
import messages from '../messages';

function CommentEditor({
  intl,
  comment,
  onCloseEditor,
}) {
  const dispatch = useDispatch();
  const saveUpdatedComment = async (values) => {
    if (comment.id) {
      dispatch(editComment(comment.id, values));
    } else {
      await dispatch(addComment(values.comment, comment.threadId, comment.parentId));
    }
    onCloseEditor();
  };
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
        <>
          <Form onSubmit={handleSubmit}>
            <TinyMCEEditor
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
              <StatefulButton
                labels={{
                  default: intl.formatMessage(messages.cancel),
                }}
                variant="outline-primary"
                onClick={onCloseEditor}
              />
              <StatefulButton
                labels={{
                  default: intl.formatMessage(messages.submit),
                }}
                className="ml-2"
                variant="primary"
                onClick={handleSubmit}
              />
            </div>
          </Form>
        </>
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
