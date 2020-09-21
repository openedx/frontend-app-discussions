import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import Breadcrumb from '@edx/paragon/dist/Breadcrumb';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { Routes } from '../../../data/constants';
import messages from './messages';
import { selectCourseTopic, selectTopicCategory } from '../../topics/data/selectors';
import { fetchCourseTopics } from '../../topics/data/thunks';

function BreadcrumbMenu({ intl }) {
  const { courseId, category, topicId } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    // The courseId from the URL is the course we WANT to load.
    dispatch(fetchCourseTopics(courseId));
  }, [courseId]);

  const topic = useSelector(selectCourseTopic(topicId));
  const topicCategory = useSelector(selectTopicCategory(topicId));

  const crumbs = [
    {
      url: Routes.TOPICS.ALL.replace(':courseId', courseId),
      label: intl.formatMessage(messages.all_topics),
    },
    {
      url: Routes.TOPICS.CATEGORY.replace(':courseId', courseId).replace(':category', category || (topicCategory && topicCategory.name)),
      label: category || (topicCategory && topicCategory.name),
    },
    {
      url: Routes.POSTS.PATH.replace(':courseId', courseId).replace(':topicId', topicId),
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
