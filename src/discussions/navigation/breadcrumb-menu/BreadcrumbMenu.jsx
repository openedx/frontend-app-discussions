import React from 'react';

import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Breadcrumb } from '@edx/paragon';

import { Routes } from '../../../data/constants';
import { selectCourseTopic, selectTopicCategory } from '../../topics/data/selectors';
import messages from './messages';

function BreadcrumbMenu({ intl }) {
  const {
    courseId,
    category,
    topicId,
  } = useParams();
  const topic = useSelector(selectCourseTopic(topicId));
  const topicCategory = useSelector(selectTopicCategory(topicId));
  const history = useHistory();

  const crumbs = [
    {
      url: Routes.TOPICS.ALL.replace(':courseId', courseId),
      label: intl.formatMessage(messages.allTopics),
    },
    {
      url: Routes.TOPICS.CATEGORY.replace(':courseId', courseId)
        .replace(':category', category || (topicCategory && topicCategory.name)),
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
        clickHandler={(e) => {
          e.preventDefault();
          history.push(e.target.pathname);
        }}
      />
    </div>
  );
}

BreadcrumbMenu.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(BreadcrumbMenu);
