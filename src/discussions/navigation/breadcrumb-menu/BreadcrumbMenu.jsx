import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import Breadcrumb from '@edx/paragon/dist/Breadcrumb';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { Routes } from '../../../data/constants';
import messages from './messages';
import { buildDiscussionsUrl } from '../../utils';
import { selectCoursePost } from '../../posts/data/selectors';
import { selectCourseTopic, selectTopicCategory } from '../../topics/data/selectors';
import { fetchCourseTopics } from '../../topics/data/thunks';

function BreadcrumbMenu({ intl }) {
  const {
    embed,
    view,
    courseId,
    categoryName,
    topicId,
    postId,
  } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    // The courseId from the URL is the course we WANT to load.
    dispatch(fetchCourseTopics(courseId));
  }, [courseId]);

  const post = useSelector(selectCoursePost(postId));
  const topic = useSelector(selectCourseTopic(post ? post.topic_id : topicId));
  const topicCategory = useSelector(selectTopicCategory(post ? post.topic_id : topicId));

  const crumbs = [
    {
      url: buildDiscussionsUrl(Routes.TOPICS.PATH, { embed, view, courseId }),
      label: intl.formatMessage(messages.all_topics),
    },
    {
      url: buildDiscussionsUrl(Routes.TOPICS.CATEGORY, {
        embed,
        view,
        courseId,
        categoryName: categoryName || (topicCategory && topicCategory.name),
      }),
      label: categoryName || (topicCategory && topicCategory.name),
    },
    {
      url: buildDiscussionsUrl(Routes.POSTS.PATH, {
        embed,
        view,
        courseId,
        topicId: post ? post.topic_id : topicId,
      }),
      label: (topic && topic.name) || null,
    },
  ].filter(crumb => Boolean(crumb.label));

  const activeLabel = crumbs.pop().label;

  return (
    <div className="breadcrumb-menu d-flex flex-row mt-2 mx-3">
      <Breadcrumb
        links={crumbs}
        activeLabel={activeLabel}
        spacer={<span className="custom-spacer">/</span>}
      />
    </div>
  );
}

BreadcrumbMenu.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(BreadcrumbMenu);
