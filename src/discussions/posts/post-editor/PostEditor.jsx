import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { Formik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import * as Yup from 'yup';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Button, Card, Form, Spinner, StatefulButton,
} from '@edx/paragon';
import { Help, Post } from '@edx/paragon/icons';

import { TinyMCEEditor } from '../../../components';
import FormikErrorFeedback from '../../../components/FormikErrorFeedback';
import { useDispatchWithState } from '../../../data/hooks';
import { selectCourseCohorts } from '../../cohorts/data/selectors';
import { fetchCourseCohorts } from '../../cohorts/data/thunks';
import { selectAnonymousPostingConfig, selectDivisionSettings, selectUserIsPrivileged } from '../../data/selectors';
import { selectCoursewareTopics, selectNonCoursewareIds, selectNonCoursewareTopics } from '../../topics/data/selectors';
import {
  discussionsPath, formikCompatibleHandler, isFormikFieldInvalid, useCommentsPagePath,
} from '../../utils';
import { hidePostEditor } from '../data';
import { selectThread } from '../data/selectors';
import { createNewThread, fetchThread, updateExistingThread } from '../data/thunks';
import messages from './messages';

function DiscussionPostType({
  value,
  type,
  selected,
  description,
  icon,
}) {
  // Need to use regular label since Form.Label doesn't support overriding htmlFor
  return (
    <label htmlFor={`post-type-${value}`} className="d-flex p-0 my-0 mr-3">
      <Form.Radio value={value} id={`post-type-${value}`} className="sr-only">{type}</Form.Radio>
      <Card className={selected ? 'border border-primary border-2' : ''}>
        <Card.Body>
          <Card.Text className="d-flex flex-column align-items-center">
            <span className="text-gray-900">{icon}</span>
            <span>{type}</span>
            <span className="x-small text-gray-500">{description}</span>
          </Card.Text>
        </Card.Body>
      </Card>
    </label>
  );
}

DiscussionPostType.propTypes = {
  value: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.element.isRequired,
};

function PostEditor({
  intl,
  editExisting,
}) {
  const dispatch = useDispatch();
  const [submitting, dispatchSubmit] = useDispatchWithState();
  const history = useHistory();
  const location = useLocation();
  const commentsPagePath = useCommentsPagePath();
  const {
    courseId,
    topicId,
    postId,
  } = useParams();

  const nonCoursewareTopics = useSelector(selectNonCoursewareTopics);
  const nonCoursewareIds = useSelector(selectNonCoursewareIds);
  const coursewareTopics = useSelector(selectCoursewareTopics);
  const {
    allowAnonymous,
    allowAnonymousToPeers,
  } = useSelector(selectAnonymousPostingConfig);
  const cohorts = useSelector(selectCourseCohorts);
  const post = useSelector(selectThread(postId));
  const userIsPrivileged = useSelector(selectUserIsPrivileged);
  const settings = useSelector(selectDivisionSettings);
  const canSelectCohort = (tId) => {
    // If the user isn't privileged, they can't edit the cohort.
    // If the topic is being edited the cohort can't be changed.
    if (!userIsPrivileged || editExisting) {
      return false;
    }
    if (nonCoursewareIds.includes(tId)) {
      return settings.dividedCourseWideDiscussions.includes(tId);
    }
    return settings.alwaysDivideInlineDiscussions || settings.dividedInlineDiscussions.includes(tId);
  };
  const hideEditor = () => {
    if (editExisting) {
      const newLocation = discussionsPath(commentsPagePath, {
        courseId,
        topicId,
        postId,
      })(location);
      history.push(newLocation);
    }
    dispatch(hidePostEditor());
  };

  const submitForm = async (values) => {
    if (editExisting) {
      await dispatchSubmit(updateExistingThread(postId, {
        topicId: values.topic,
        type: values.postType,
        title: values.title,
        content: values.comment,
      }));
    } else {
      const cohort = canSelectCohort(values.topic)
        // null stands for no cohort restriction ("All learners" option)
        ? (values.cohort || null)
        // if not allowed to set cohort, always undefined, so no value is sent to backend
        : undefined;
      await dispatchSubmit(createNewThread({
        courseId,
        topicId: values.topic,
        type: values.postType,
        title: values.title,
        content: values.comment,
        following: values.following,
        anonymous: allowAnonymous ? values.anonymous : undefined,
        anonymousToPeers: allowAnonymousToPeers ? values.anonymousToPeers : undefined,
        cohort,
      }));
    }
    hideEditor();
  };

  useEffect(() => {
    if (userIsPrivileged) {
      dispatch(fetchCourseCohorts(courseId));
    }
    if (editExisting) {
      dispatch(fetchThread(postId));
    }
  }, [courseId, editExisting]);

  if (editExisting && !post) {
    return (
      <div className="m-4 card p-4 align-items-center">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }
  let initialValues = {
    postType: 'discussion',
    topic: topicId || nonCoursewareTopics?.[0]?.id,
    title: '',
    comment: '',
    follow: true,
    anonymous: false,
    anonymousToPeers: false,
  };
  if (editExisting) {
    initialValues = {
      postType: post.type,
      topic: post.topicId,
      title: post.title,
      comment: post.rawBody,
      follow: (post.following === null || post.following === undefined) ? true : post.following,
      anonymous: allowAnonymous ? false : undefined,
      anonymousToPeers: allowAnonymousToPeers ? false : undefined,
    };
  }

  const postEditorId = `post-editor-${editExisting ? postId : 'new'}`;

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={Yup.object()
        .shape({
          postType: Yup.mixed()
            .oneOf(['discussion', 'question']),
          topic: Yup.string()
            .required(),
          title: Yup.string()
            .required(intl.formatMessage(messages.titleError)),
          comment: Yup.string()
            .required(intl.formatMessage(messages.commentError)),
          follow: Yup.bool()
            .default(true),
          anonymous: Yup.bool()
            .default(false)
            .nullable(),
          anonymousToPeers: Yup.bool()
            .default(false)
            .nullable(),
          cohort: Yup.string()
            .nullable()
            .default(null),
        })}
      onSubmit={submitForm}
    >{
      ({
        values,
        errors,
        touched,
        handleSubmit,
        handleBlur,
        handleChange,
      }) => (
        <Form className="m-4 card p-4" onSubmit={handleSubmit}>
          <h3>
            {editExisting
              ? intl.formatMessage(messages.editPostHeading)
              : intl.formatMessage(messages.addPostHeading)}
          </h3>
          <Form.RadioSet
            name="postType"
            className="d-flex flex-row my-3"
            value={values.postType}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-label={intl.formatMessage(messages.postTitle)}
          >
            <DiscussionPostType
              value="discussion"
              selected={values.postType === 'discussion'}
              type={intl.formatMessage(messages.discussionType)}
              icon={<Post />}
              description={intl.formatMessage(messages.discussionDescription)}
            />
            <DiscussionPostType
              value="question"
              selected={values.postType === 'question'}
              type={intl.formatMessage(messages.questionType)}
              icon={<Help />}
              description={intl.formatMessage(messages.questionDescription)}
            />
          </Form.RadioSet>
          <div className="py-3">
            <Form.Group className="w-50 d-inline-block pr-2">
              <Form.Control
                name="topic"
                as="select"
                value={values.topic}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-describedby="topicAreaInput"
                floatingLabel={intl.formatMessage(messages.topicArea)}
              >
                {nonCoursewareTopics.map(topic => (
                  <option key={topic.id} value={topic.id}>{topic.name}</option>
                ))}
                {coursewareTopics.map(category => (
                  <optgroup label={category.name} key={category.id}>
                    {category.topics.map(subtopic => (
                      <option key={subtopic.id} value={subtopic.id}>
                        {subtopic.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </Form.Control>
            </Form.Group>
            {canSelectCohort(values.topic)
              && (
                <Form.Group className="w-50 d-inline-block pl-2">
                  <Form.Control
                    name="cohort"
                    as="select"
                    value={values.cohort}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    floatingLabel={intl.formatMessage(messages.cohortVisibility)}
                  >
                    <option value="">{intl.formatMessage(messages.cohortVisibilityAllLearners)}</option>
                    {cohorts.map(cohort => (
                      <option key={cohort.id} value={cohort.id}>{cohort.name}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
              )}
          </div>
          <div className="border-bottom my-1" />
          <Form.Group
            className="py-2 mt-4"
            isInvalid={isFormikFieldInvalid('title', {
              errors,
              touched,
            })}
          >
            <Form.Control
              name="title"
              type="text"
              onChange={handleChange}
              onBlur={handleBlur}
              aria-describedby="titleInput"
              floatingLabel={intl.formatMessage(messages.postTitle)}
              value={values.title}
            />
            <FormikErrorFeedback name="title" />
          </Form.Group>
          <div className="py-2">
            <TinyMCEEditor
              id={postEditorId}
              value={values.comment}
              onEditorChange={formikCompatibleHandler(handleChange, 'comment')}
              onBlur={formikCompatibleHandler(handleBlur, 'comment')}
            />
            <FormikErrorFeedback name="comment" />
          </div>

          {!editExisting
            && (
              <div className="d-flex flex-row mt-3">
                <Form.Group>
                  <Form.Checkbox
                    name="follow"
                    checked={values.follow}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="mr-4"
                  >
                    {intl.formatMessage(messages.followPost)}
                  </Form.Checkbox>
                </Form.Group>
                {allowAnonymous && (
                  <Form.Group>
                    <Form.Checkbox
                      name="anonymous"
                      checked={values.anonymous}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="mr-4"
                    >
                      {intl.formatMessage(messages.anonymousPost)}
                    </Form.Checkbox>
                  </Form.Group>
                )}
                {allowAnonymousToPeers
                  && (
                    <Form.Group>
                      <Form.Checkbox
                        name="anonymousToPeers"
                        checked={values.anonymousToPeers}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      >
                        {intl.formatMessage(messages.anonymousToPeersPost)}
                      </Form.Checkbox>
                    </Form.Group>
                  )}
              </div>
            )}

          <div className="d-flex justify-content-end">
            <Button
              variant="outline-primary"
              onClick={hideEditor}
            >{intl.formatMessage(messages.cancel)}
            </Button>
            <StatefulButton
              labels={{
                default: intl.formatMessage(messages.submit),
                pending: intl.formatMessage(messages.submitting),
              }}
              state={submitting ? 'pending' : 'default'}
              className="ml-2"
              variant="primary"
              onClick={handleSubmit}
            />
          </div>
        </Form>
      )
    }
    </Formik>
  );
}

PostEditor.propTypes = {
  intl: intlShape.isRequired,
  editExisting: PropTypes.bool,
};

PostEditor.defaultProps = {
  editExisting: false,
};

export default injectIntl(PostEditor);
