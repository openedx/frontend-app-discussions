import React from 'react';

import { useSelector } from 'react-redux';
import { generatePath, useHistory, useRouteMatch } from 'react-router';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Breadcrumb } from '@edx/paragon';

import { Routes } from '../../../data/constants';
import { selectTopic } from '../../topics/data/selectors';
import messages from './messages';

function BreadcrumbMenu({ intl }) {
  const {
    params: {
      courseId,
      category,
      topicId,
    },
  } = useRouteMatch([Routes.TOPICS.CATEGORY, Routes.TOPICS.TOPIC]);
  const topic = useSelector(selectTopic(topicId));
  const history = useHistory();

  const crumbs = [
    {
      url: () => generatePath(Routes.TOPICS.ALL, { courseId }),
      label: intl.formatMessage(messages.allTopics),
    },
    {
      url: () => generatePath(Routes.TOPICS.CATEGORY, {
        courseId,
        category: category || topic?.categoryId,
      }),
      label: category || topic?.categoryId,
    },
    {
      url: () => generatePath(Routes.TOPICS.TOPIC, {
        courseId,
        topicId,
      }),
      label: topic?.name,
    },
  ].filter(crumb => Boolean(crumb.label))
    .map(({
      url,
      label,
    }) => ({
      url: url(),
      label,
    }));

  const activeLabel = crumbs.pop().label;

  return (
    <div className="breadcrumb-menu d-flex flex-row mt-2 mx-3">
      <Breadcrumb
        links={crumbs}
        activeLabel={activeLabel}
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
