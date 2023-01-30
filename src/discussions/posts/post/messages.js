import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  anonymous: {
    id: 'discussions.post.author.anonymous',
    defaultMessage: 'anonymous',
    description: 'Author name displayed when a post is anonymous',
  },
  addResponse: {
    id: 'discussions.post.addResponse',
    defaultMessage: 'Add response',
    description: 'Button to add a response in a thread of forum posts',
  },
  lastResponse: {
    id: 'discussions.post.lastResponse',
    defaultMessage: 'Last response {time}',
  },
  postedOn: {
    id: 'discussions.post.postedOn',
    defaultMessage: 'Posted {time} by {author} {authorLabel}',
  },
  contentReported: {
    id: 'discussions.post.contentReported',
    defaultMessage: 'Reported',
    description: 'Content reported for staff review',
  },
  following: {
    id: 'discussions.post.following',
    defaultMessage: 'Following',
  },
  follow: {
    id: 'discussions.post.follow',
    defaultMessage: 'Follow',
    description: 'Tooltip/alttext for button to follow a discussion post',
  },
  followed: {
    id: 'discussions.post.followed',
    defaultMessage: 'Followed',
    description: 'Tooltip/alttext for follow icon showing user followed a post',
  },
  notFollowed: {
    id: 'discussions.post.notFollowed',
    defaultMessage: 'Not Followed',
    description: 'Tooltip/alttext for follow icon showing user not following a post',
  },
  answered: {
    id: 'discussions.post.answered',
    defaultMessage: 'Answered',
    description: 'Tooltip/alttext for button to unfollow a discussion post',
  },
  unFollow: {
    id: 'discussions.post.unFollow',
    defaultMessage: 'Unfollow',
    description: 'Tooltip/alttext for button to unfollow a discussion post',
  },
  like: {
    id: 'discussions.post.like',
    defaultMessage: 'Like',
    description: 'Tooltip/alttext for button to like a discussion post',
  },
  removeLike: {
    id: 'discussions.post.removeLike',
    defaultMessage: 'Unlike',
    description: 'Tooltip/alttext for button to remove the like applied to a discussion post',
  },
  likedPost: {
    id: 'discussions.post.liked',
    defaultMessage: 'liked',
    description: 'Tooltip/alttext for like icon to tell user this post is liked by user',
  },
  postLikes: {
    id: 'discussions.post.likes',
    defaultMessage: 'likes',
    description: 'Tooltip/alttext for like icon to tell user about like on the post',
  },
  viewActivity: {
    id: 'discussions.post.viewActivity',
    defaultMessage: 'View activity',
    description: 'Tooltip/alttext for button to view the activity of a discussion post',
  },
  activity: {
    id: 'discussions.post.activity',
    defaultMessage: 'Activity',
    description: 'Tooltip/alttext for icon for showing icon represents activity on a post',
  },
  postClosed: {
    id: 'discussions.post.closed',
    defaultMessage: 'Post closed for responses and comments',
    description: 'Tooltip/alttext for icon displayed when post is closed',
  },
  relatedTo: {
    id: 'discussions.post.relatedTo',
    defaultMessage: 'Related to',
    description: 'Message followed the category and topic of post linking to in-course context',
  },
  deletePostTitle: {
    id: 'discussions.editor.delete.post.title',
    defaultMessage: 'Delete post',
  },
  deletePostDescription: {
    id: 'discussions.editor.delete.post.description',
    defaultMessage: 'Are you sure you want to permanently delete this post?',
  },
  deleteConfirmationDelete: {
    id: 'discussions.post.delete.confirmation.button.delete',
    defaultMessage: 'Delete',
    description: 'Delete button shown on delete confirmation dialog',
  },
  reportPostTitle: {
    id: 'discussions.editor.report.post.title',
    defaultMessage: 'Report inappropriate content?',
    description: 'Title of confirmation dialog shown when reporting a post',
  },
  reportPostDescription: {
    id: 'discussions.editor.report.post.description',
    defaultMessage: 'The discussion moderation team will review this content and take appropriate action.',
    description: 'Text displayed in confirmation dialog when deleting a post',
  },
  closePostModalTitle: {
    id: 'discussions.post.closePostModal.title',
    defaultMessage: 'Close post',
    description: 'Title for the close post reason modal',
  },
  closePostModalText: {
    id: 'discussions.post.closePostModal.text',
    defaultMessage: 'Enter a reason for closing this post. This will only be displayed to other moderators.',
    description: 'Description for the close post reason modal',
  },
  closePostModalReasonCodeInput: {
    id: 'discussions.post.closePostModal.reasonCodeInput',
    defaultMessage: 'Reason',
    description: 'Label for the close reason code selector input',
  },
  closePostModalButtonCancel: {
    id: 'discussions.post.closePostModal.cancel',
    defaultMessage: 'Cancel',
    description: 'Cancel button label for the close post reason modal',
  },
  closePostModalButtonConfirm: {
    id: 'discussions.post.closePostModal.confirm',
    defaultMessage: 'Close post',
    description: 'Confirm button label for the close post reason modal',
  },
  newLabel: {
    id: 'discussions.post.label.new',
    defaultMessage: '{count} New',
    description: 'Label shown on the badge indicating new comments/posts like "3 new"',
  },
  editedBy: {
    id: 'discussions.post.editedBy',
    defaultMessage: 'Edited by',
    description: 'Message shown to user to inform them who edited a post',
  },
  reason: {
    id: 'discussions.post.editReason',
    defaultMessage: 'Reason',
    description: 'Message shown to user to inform them why a post was edited',
  },
  postWithoutPreview: {
    id: 'discussions.post.postWithoutPreview',
    defaultMessage: 'No preview available',
    description: 'No preview available',
  },
  srOnlyFollowDescription: {
    id: 'discussions.post.follow.description',
    defaultMessage: 'you are following this post',
    description: 'tell screen readers if user is following a post',
  },
  srOnlyUnFollowDescription: {
    id: 'discussions.post.unfollow.description',
    defaultMessage: 'you are not following this post',
    description: 'tell screen readers if user is not following a post',
  },
});

export default messages;
