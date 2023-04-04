import React, {
  useContext, useEffect, useRef,
} from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import { Formik } from 'formik';
import { isEmpty } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import * as Yup from 'yup';

import { useIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import {
  Button, Card, Form, Spinner, StatefulButton,
} from '@edx/paragon';
import { Help, Post } from '@edx/paragon/icons';

import { TinyMCEEditor } from '../../../components';
import FormikErrorFeedback from '../../../components/FormikErrorFeedback';
import PostPreviewPanel from '../../../components/PostPreviewPanel';
import { useDispatchWithState } from '../../../data/hooks';
import { selectCourseCohorts } from '../../cohorts/data/selectors';
import { fetchCourseCohorts } from '../../cohorts/data/thunks';
import { DiscussionContext } from '../../common/context';
import { useCurrentDiscussionTopic } from '../../data/hooks';
import {
  selectAnonymousPostingConfig,
  selectDivisionSettings,
  selectEnableInContext,
  selectModerationSettings,
  selectUserHasModerationPrivileges,
  selectUserIsGroupTa,
  selectUserIsStaff,
} from '../../data/selectors';
import { EmptyPage } from '../../empty-posts';
import {
  selectArchivedTopics,
  selectCoursewareTopics as inContextCourseware,
  selectNonCoursewareIds as inContextCoursewareIds,
  selectNonCoursewareTopics as inContextNonCourseware,
} from '../../in-context-topics/data/selectors';
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
  icon,
}) {
  const { enableInContextSidebar } = useContext(DiscussionContext);
  // Need to use regular label since Form.Label doesn't support overriding htmlFor
  return (
    <label htmlFor={`post-type-${value}`} className="d-flex p-0 my-0 mr-3">
      <Form.Radio value={value} id={`post-type-${value}`} className="sr-only">{type}</Form.Radio>
      <Card
        className={classNames('border-2 shadow-none', {
          'border-primary': selected,
          'border-light-400': !selected,
        })}
        style={{ cursor: 'pointer', width: `${enableInContextSidebar ? '10.021rem' : '14.25rem'}` }}
      >
        <Card.Section className="px-4 py-3 d-flex flex-column align-items-center">
          <span className="text-primary-300 mb-0.5">{icon}</span>
          <span className="text-gray-700">{type}</span>
        </Card.Section>
      </Card>
    </label>
  );
}

DiscussionPostType.propTypes = {
  value: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  icon: PropTypes.element.isRequired,
};

function PostEditor({
  editExisting,
}) {
  console.log('PostEditor', editExisting);
  const intl = useIntl();
  const { authenticatedUser } = useContext(AppContext);
  const dispatch = useDispatch();
  const editorRef = useRef(null);
  const [submitting, dispatchSubmit] = useDispatchWithState();
  const history = useHistory();
  const location = useLocation();
  const commentsPagePath = useCommentsPagePath();
  const {
    courseId,
    postId,
  } = useParams();
  const { category, enableInContextSidebar } = useContext(DiscussionContext);
  const topicId = useCurrentDiscussionTopic();
  const enableInContext = useSelector(selectEnableInContext);
  const nonCoursewareTopics = useSelector(enableInContext ? inContextNonCourseware : selectNonCoursewareTopics);
  const nonCoursewareIds = useSelector(enableInContext ? inContextCoursewareIds : selectNonCoursewareIds);
  const coursewareTopics = useSelector(enableInContext ? inContextCourseware : selectCoursewareTopics);
  const cohorts = useSelector(selectCourseCohorts);
  const post = useSelector(editExisting ? selectThread(postId) : () => ({}));
  const userHasModerationPrivileges = useSelector(selectUserHasModerationPrivileges);
  const userIsGroupTa = useSelector(selectUserIsGroupTa);
  const settings = useSelector(selectDivisionSettings);
  const { allowAnonymous, allowAnonymousToPeers } = useSelector(selectAnonymousPostingConfig);
  const { reasonCodesEnabled, editReasons } = useSelector(selectModerationSettings);
  const userIsStaff = useSelector(selectUserIsStaff);
  const archivedTopics = useSelector(selectArchivedTopics);

  const canDisplayEditReason = (reasonCodesEnabled && editExisting
    && (userHasModerationPrivileges || userIsGroupTa || userIsStaff)
    && post?.author !== authenticatedUser.username
  );

  const editReasonCodeValidation = canDisplayEditReason && {
    editReasonCode: Yup.string().required(intl.formatMessage(messages.editReasonCodeError)),
  };

  const canSelectCohort = (tId) => {
    // If the user isn't privileged, they can't edit the cohort.
    // If the topic is being edited the cohort can't be changed.
    if (!userHasModerationPrivileges) {
      return false;
    }
    if (nonCoursewareIds.includes(tId)) {
      return settings.dividedCourseWideDiscussions.includes(tId);
    }
    const isCohorting = settings.alwaysDivideInlineDiscussions || settings.dividedInlineDiscussions.includes(tId);
    return isCohorting;
  };

  const initialValues = {
    postType: post?.type || 'discussion',
    topic: post?.topicId || topicId || nonCoursewareTopics?.[0]?.id,
    title: post?.title || '',
    comment: post?.rawBody || '',
    follow: isEmpty(post?.following) ? true : post?.following,
    anonymous: allowAnonymous ? false : undefined,
    anonymousToPeers: allowAnonymousToPeers ? false : undefined,
    editReasonCode: post?.lastEdit?.reasonCode || (userIsStaff && canDisplayEditReason ? 'violates-guidelines' : undefined),
    cohort: post?.cohort || 'default',
  };

  const hideEditor = (resetForm) => {
    resetForm({ values: initialValues });
    if (editExisting) {
      const newLocation = discussionsPath(commentsPagePath, {
        courseId,
        topicId,
        postId,
        learnerUsername: post?.author,
        category,
      })(location);
      history.push(newLocation);
    }
    dispatch(hidePostEditor());
  };
  // null stands for no cohort restriction ("All learners" option)
  const selectedCohort = (cohort) => (cohort === 'default' ? null : cohort);
  const submitForm = async (values, { resetForm }) => {
    if (editExisting) {
      await dispatchSubmit(updateExistingThread(postId, {
        topicId: values.topic,
        type: values.postType,
        title: values.title,
        content: values.comment,
        editReasonCode: values.editReasonCode || undefined,
      }));
    } else {
      const cohort = canSelectCohort(values.topic) ? selectedCohort(values.cohort) : undefined;
      // if not allowed to set cohort, always undefined, so no value is sent to backend
      await dispatchSubmit(createNewThread({
        courseId,
        topicId: values.topic,
        type: values.postType,
        title: values.title,
        content: values.comment,
        following: values.follow,
        anonymous: allowAnonymous ? values.anonymous : undefined,
        anonymousToPeers: allowAnonymousToPeers ? values.anonymousToPeers : undefined,
        cohort,
        enableInContextSidebar,
      }));
    }
    /* istanbul ignore if: TinyMCE is mocked so this cannot be easily tested */
    if (editorRef.current) {
      editorRef.current.plugins.autosave.removeDraft();
    }
    hideEditor(resetForm);
  };

  useEffect(() => {
    if (userHasModerationPrivileges && isEmpty(cohorts)) {
      dispatch(fetchCourseCohorts(courseId));
    }
    if (editExisting) {
      dispatchSubmit(fetchThread(postId, courseId));
    }
  }, [courseId, editExisting]);

  if (editExisting && !post) {
    if (submitting) {
      return (
        <div className="m-4 card p-4 align-items-center">
          <Spinner animation="border" variant="primary" />
        </div>
      );
    }
    if (!submitting) {
      return (
        <EmptyPage
          title={intl.formatMessage(messages.noThreadFound)}
        />
      );
    }
  }

  const validationSchema = Yup.object().shape({
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
    ...editReasonCodeValidation,
  });

  const postEditorId = `post-editor-${editExisting ? postId : 'new'}`;

  const handleInContextSelectLabel = (section, subsection) => (
    `${section.displayName} / ${subsection.displayName}` || intl.formatMessage(messages.unnamedTopics)
  );

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={submitForm}
    >{
      ({
        values,
        errors,
        touched,
        handleSubmit,
        handleBlur,
        handleChange,
        resetForm,
      }) => (
        <Form className="m-4 card p-4 post-form" onSubmit={handleSubmit}>
          <h4 className="mb-4 font-style font-size-16" style={{ lineHeight: '16px' }}>
            {editExisting
              ? intl.formatMessage(messages.editPostHeading)
              : intl.formatMessage(messages.addPostHeading)}
          </h4>
          <Form.RadioSet
            name="postType"
            className="d-flex flex-row flex-wrap"
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
            />
            <DiscussionPostType
              value="question"
              selected={values.postType === 'question'}
              type={intl.formatMessage(messages.questionType)}
              icon={<Help />}
            />
          </Form.RadioSet>
          <div className="d-flex flex-row my-4.5 justify-content-between">
            <Form.Group className="w-100 m-0">
              <Form.Control
                className="m-0"
                name="topic"
                as="select"
                value={values.topic}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-describedby="topicAreaInput"
                floatingLabel={intl.formatMessage(messages.topicArea)}
                disabled={enableInContextSidebar}
              >
                {nonCoursewareTopics.map(topic => (
                  <option
                    key={topic.id}
                    value={topic.id}
                  >{topic.name || intl.formatMessage(messages.unnamedSubTopics)}
                  </option>
                ))}
                {enableInContext ? (
                  <>
                    {coursewareTopics?.map(section => (
                      section?.children?.map(subsection => (
                        <optgroup
                          label={handleInContextSelectLabel(section, subsection)}
                          key={subsection.id}
                        >
                          {subsection?.children?.map(unit => (
                            <option key={unit.id} value={unit.id}>
                              {unit.name || intl.formatMessage(messages.unnamedSubTopics)}
                            </option>
                          ))}
                        </optgroup>
                      ))
                    ))}
                    {(userIsStaff || userIsGroupTa || userHasModerationPrivileges) && (
                      <optgroup label={intl.formatMessage(messages.archivedTopics)}>
                        {archivedTopics.map(topic => (
                          <option key={topic.id} value={topic.id}>
                            {topic.name || intl.formatMessage(messages.unnamedSubTopics)}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </>
                ) : (
                  coursewareTopics.map(categoryObj => (
                    <optgroup
                      label={categoryObj.name || intl.formatMessage(messages.unnamedTopics)}
                      key={categoryObj.id}
                    >
                      {categoryObj.topics.map(subtopic => (
                        <option key={subtopic.id} value={subtopic.id}>
                          {subtopic.name || intl.formatMessage(messages.unnamedSubTopics)}
                        </option>
                      ))}
                    </optgroup>
                  ))
                )}
              </Form.Control>
            </Form.Group>
            {canSelectCohort(values.topic) && (
              <Form.Group className="w-100 ml-3 mb-0">
                <Form.Control
                  className="m-0"
                  name="cohort"
                  as="select"
                  value={values.cohort}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-describedby="cohortAreaInput"
                  floatingLabel={intl.formatMessage(messages.cohortVisibility)}
                >
                  <option value="default">{intl.formatMessage(messages.cohortVisibilityAllLearners)}</option>
                  {cohorts.map(cohort => (
                    <option key={cohort.id} value={cohort.id}>{cohort.name}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            )}
          </div>

          <div className="d-flex flex-row mb-4.5 justify-content-between">
            <Form.Group
              className="w-100 m-0"
              isInvalid={isFormikFieldInvalid('title', {
                errors,
                touched,
              })}
            >
              <Form.Control
                className="m-0"
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
            {canDisplayEditReason && (
              <Form.Group
                className="w-100 ml-4 mb-0"
                isInvalid={isFormikFieldInvalid('editReasonCode', {
                  errors,
                  touched,
                })}
              >
                <Form.Control
                  name="editReasonCode"
                  className="m-0"
                  as="select"
                  value={values.editReasonCode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-describedby="editReasonCodeInput"
                  floatingLabel={intl.formatMessage(messages.editReasonCode)}
                >
                  <option key="empty" value="">---</option>
                  {editReasons.map(({ code, label }) => (
                    <option key={code} value={code}>{label}</option>
                  ))}
                </Form.Control>
                <FormikErrorFeedback name="editReasonCode" />
              </Form.Group>
            )}
          </div>
          <div className="mb-3">
            <TinyMCEEditor
              onInit={
                /* istanbul ignore next: TinyMCE is mocked so this cannot be easily tested */
                (_, editor) => {
                  editorRef.current = editor;
                }
              }
              id={postEditorId}
              value={values.comment}
              onEditorChange={formikCompatibleHandler(handleChange, 'comment')}
              onBlur={formikCompatibleHandler(handleBlur, 'comment')}
            />
            <FormikErrorFeedback name="comment" />
          </div>

          <PostPreviewPanel htmlNode={values.comment} isPost editExisting={editExisting} />

          <div className="d-flex flex-row mt-n4 w-75 text-primary font-style">
            {!editExisting && (
              <>
                <Form.Group>
                  <Form.Checkbox
                    name="follow"
                    checked={values.follow}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="mr-4.5"
                  >
                    <span className="font-size-14">
                      {intl.formatMessage(messages.followPost)}
                    </span>
                  </Form.Checkbox>
                </Form.Group>
                {allowAnonymousToPeers && (
                  <Form.Group>
                    <Form.Checkbox
                      name="anonymousToPeers"
                      checked={values.anonymousToPeers}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      <span className="font-size-14">
                        {intl.formatMessage(messages.anonymousToPeersPost)}
                      </span>
                    </Form.Checkbox>
                  </Form.Group>
                )}
              </>
            )}
          </div>

          <div className="d-flex justify-content-end">
            <Button
              variant="outline-primary"
              onClick={() => hideEditor(resetForm)}
            >
              {intl.formatMessage(messages.cancel)}
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
  editExisting: PropTypes.bool,
};

PostEditor.defaultProps = {
  editExisting: false,
};

export default PostEditor;
