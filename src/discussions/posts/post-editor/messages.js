import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  type: {
    id: 'discussions.post.editor.type',
    defaultMessage: 'Post type',
  },
  addPostHeading: {
    id: 'discussions.post.editor.addPostHeading',
    defaultMessage: 'Add a post',
  },
  editPostHeading: {
    id: 'discussions.post.editor.editPostHeading',
    defaultMessage: 'Edit post',
  },
  typeDescription: {
    id: 'discussions.post.editor.typeDescription',
    defaultMessage: 'Questions raise issues that need answers. Discussions share ideas and start conversations.',
  },
  required: {
    id: 'discussions.post.editor.required',
    defaultMessage: 'Required',
  },
  questionType: {
    id: 'discussions.post.editor.questionType',
    defaultMessage: 'Question',
  },
  questionDescription: {
    id: 'discussions.post.editor.questionDescription',
    defaultMessage: 'Raise issues that need answers',
  },
  discussionType: {
    id: 'discussions.post.editor.discussionType',
    defaultMessage: 'Discussion',
  },
  discussionDescription: {
    id: 'discussions.post.editor.discussionDescription',
    defaultMessage: 'Share ideas and start conversations',
  },
  topicArea: {
    id: 'discussions.post.editor.topicArea',
    defaultMessage: 'Topic area',
  },
  topicAreaDescription: {
    id: 'discussions.post.editor.topicAreaDescription',
    defaultMessage: 'Add your post to a relevant topic to help others find it.',
  },
  cohortVisibility: {
    id: 'discussions.post.editor.cohortVisibility',
    defaultMessage: 'Cohort visibility',
  },
  cohortVisibilityAllLearners: {
    id: 'discussions.post.editor.cohortVisibilityAllLearners',
    defaultMessage: 'All learners',
  },
  postTitle: {
    id: 'discussions.post.editor.title',
    defaultMessage: 'Post title',
  },
  titleDescription: {
    id: 'discussions.post.editor.titleDescription',
    defaultMessage: 'Add a clear and descriptive title to encourage participation.',
  },
  titleError: {
    id: 'discussions.post.editor.title.error',
    defaultMessage: 'Post title cannot be empty.',
  },
  commentError: {
    id: 'discussions.post.editor.content.error',
    defaultMessage: 'Post content cannot be empty.',
  },
  questionText: {
    id: 'discussions.post.editor.questionText',
    defaultMessage: 'Your question or idea (required)',
  },
  preview: {
    id: 'discussions.post.editor.preview',
    defaultMessage: 'Preview',
  },
  followPost: {
    id: 'discussions.post.editor.followPost',
    defaultMessage: 'Follow this post',
  },
  anonymousPost: {
    id: 'discussions.post.editor.anonymousPost',
    defaultMessage: 'Post anonymously',
  },
  anonymousToPeersPost: {
    id: 'discussions.post.editor.anonymousToPeersPost',
    defaultMessage: 'Post anonymously to peers',
  },
  submit: {
    id: 'discussions.editor.submit',
    defaultMessage: 'Submit',
  },
  submitting: {
    id: 'discussions.editor.submitting',
    defaultMessage: 'Submitting',
  },
  cancel: {
    id: 'discussions.editor.cancel',
    defaultMessage: 'Cancel',
  },
  editReasonCode: {
    id: 'discussions.editor.posts.editReasonCode',
    defaultMessage: 'Reason for editing',
    description: 'Label for field visible to moderators that allows them to select a reason for editing another user\'s post',
  },
  editReasonCodeError: {
    id: 'discussions.editor.posts.editReasonCode.error',
    defaultMessage: 'Select reason for editing',
    description: 'Error message visible to moderators when they submit the post/response/comment without select reason for editing',
  },
  showPreviewButton: {
    id: 'discussions.editor.posts.showPreview.button',
    defaultMessage: 'Show preview',
    description: 'show preview button text to allow user to see their post content.',
  },
  showHelpIcon: {
    id: 'discussions.editor.posts.showHelp.icon',
    defaultMessage: 'Show Help',
    description: 'show help icon to allow user to see important documentation.',
  },
  discussionHelpHeader: {
    id: 'discussions.editor.posts.discussionHelpHeader',
    defaultMessage: 'Discussions help',
    description: 'header text for post help section.',
  },
  discussionHelpDescription: {
    id: 'discussions.editor.posts.discussionHelpDescription',
    defaultMessage: 'Course discussions give you the opportunity to start conversations, ask questions, and interact with other learners. See the links below to learn more:',
    description: 'description message for post help section.',
  },
  discussionHelpCourseParticipation: {
    id: 'discussions.editor.posts.discussionHelpCourseParticipation',
    defaultMessage: 'Participating in course discussions',
    description: 'Documentation link title for participating in course discussions.',
  },
  discussionHelpMathExpressions: {
    id: 'discussions.editor.posts.discussionHelpMathExpressions',
    defaultMessage: 'Entering math expressions in course discussions',
    description: 'Documentation link title for entering math expressions in course discussions.',
  },
  discussionHelpTooltip: {
    id: 'discussions.editor.posts.discussionHelpTooltip',
    defaultMessage: 'Learn more about MathJax & LaTeX',
    description: 'Tooltip help message for documentation help.',
  },
  actionsAlt: {
    id: 'discussions.actions.label',
    defaultMessage: 'Actions menu',
    description: 'Button to see actions for a post or comment',
  },
  unnamedTopics: {
    id: 'discussions.topic.noName.label',
    defaultMessage: 'Unnamed category',
    description: 'display string for topics with missing names',
  },
  unnamedSubTopics: {
    id: 'discussions.subtopic.noName.label',
    defaultMessage: 'Unnamed subcategory',
    description: 'display string for topics with missing names',
  },
  noThreadFound: {
    id: 'discussion.thread.notFound',
    defaultMessage: 'Thread not found',
    description: 'message to show on screen if the request thread is not found in course',
  },
  archivedTopics: {
    id: 'discussions.topics.archived.label',
    defaultMessage: 'Archived',
    description: 'Heading for displaying topics that are archived.',
  },
});

export default messages;
