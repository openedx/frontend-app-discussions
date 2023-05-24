import { Factory } from 'rosie';

import { getApiBaseUrl } from '../../../../data/constants';

Factory.define('topic')
  .sequence('id', ['topicPrefix'], (idx, topicPrefix) => `${topicPrefix}-${idx}`)
  .sequence('enabled-in-context', ['enabledInContext'], (idx, enabledInContext) => enabledInContext)
  .sequence('name', ['topicNamePrefix'], (idx, topicNamePrefix) => `${topicNamePrefix}-${idx}`)
  .sequence('usage-key', ['usageKey'], (idx, usageKey) => usageKey)
  .sequence('courseware', ['courseware'], (idx, courseware) => courseware)
  .attr('activeFlags', null, true)
  .attr('thread_counts', ['discussionCount', 'questionCount'], (discCount, questCount) => {
    Factory.reset('thread-counts');
    return Factory.build('thread-counts', null, { discussionCount: discCount, questionCount: questCount });
  });

Factory.define('sub-section')
  .sequence('block_id', (idx) => `${idx}`)
  .option('topicPrefix', null, '')
  .sequence('id', ['topicPrefix'], (idx, topicPrefix) => `${topicPrefix}-topic-${idx}`)
  .sequence('display-name', ['sectionPrefix'], (idx, sectionPrefix) => `Introduction ${sectionPrefix + idx}`)
  .option('courseId', null, 'course-v1:edX+DemoX+Demo_Course')
  .sequence(
    'legacy_web_url',
    ['id', 'courseId'],
    (idx, id, courseId) => `${getApiBaseUrl}/courses/${courseId}/jump_to/block-v1:${id}?experience=legacy`,
  )
  .sequence(
    'lms_web_url',
    ['id', 'courseId'],
    (idx, id, courseId) => `${getApiBaseUrl}/courses/${courseId}/jump_to/block-v1:${id}`,
  )
  .sequence(
    'student_view_url',
    ['id', 'courseId'],
    (idx, id) => `${getApiBaseUrl}/xblock/block-v1:${id}`,
  )
  .attr('type', null, 'sequential')
  .attr('activeFlags', null, true)
  .attr('thread_counts', ['discussionCount', 'questionCount'], (discCount, questCount) => {
    Factory.reset('thread-counts');
    return Factory.build('thread-counts', null, { discussionCount: discCount, questionCount: questCount });
  })
  .attr('children', ['id', 'display-name', 'courseId'], (id, name, courseId) => {
    Factory.reset('topic');
    return Factory.buildList('topic', 2, null, {
      topicPrefix: `${id}`,
      enabledInContext: true,
      topicNamePrefix: `${name}`,
      usageKey: `${courseId.replace('course-v1:', 'block-v1:')} +type@vertical+block@vertical_`,
      discussionCount: 1,
      questionCount: 1,
    });
  });

Factory.define('section')
  .sequence('block_id', (idx) => `${idx}`)
  .option('topicPrefix', null, '')
  .sequence('id', ['topicPrefix'], (idx, topicPrefix) => `${topicPrefix}-topic-${idx}-v3`)
  .attr('courseware', null, true)
  .sequence('display-name', (idx) => `Introduction ${idx}`)
  .option('courseId', null, 'course-v1:edX+DemoX+Demo_Course')
  .sequence(
    'legacy_web_url',
    ['id', 'courseId'],
    (idx, id, courseId) => `${getApiBaseUrl}/courses/${courseId}/jump_to/${courseId.replace('course-v1:', 'block-v1:')}+type@chapter+block@${id}?experience=legacy`,
  )
  .sequence(
    'lms_web_url',
    ['id', 'courseId'],
    (idx, id, courseId) => `${getApiBaseUrl}/courses/${courseId}/jump_to/${courseId.replace('course-v1:', 'block-v1:')}+type@chapter+block@${id}`,
  )
  .sequence(
    'student_view_url',
    ['id', 'courseId'],
    (idx, id, courseId) => `${getApiBaseUrl}/xblock/${courseId.replace('course-v1:', 'block-v1:')}+type@chapter+block@${id}`,
  )
  .attr('type', null, 'chapter')
  .attr('children', ['id', 'display-name'], (id, name) => {
    Factory.reset('sub-section');
    return Factory.buildList('sub-section', 2, null, {
      sectionPrefix: `${name}-`,
      topicPrefix: 'section',
      id,
      discussionCount: 1,
      questionCount: 1,
    });
  });

Factory.define('thread-counts')
  .sequence('discussion', ['discussionCount'], (idx, discussionCount) => discussionCount)
  .sequence('question', ['questionCount'], (idx, questionCount) => questionCount);

Factory.define('archived-topics')
  .attr('id', null, 'archived')
  .option('courseId', null, 'course-v1:edX+DemoX+Demo_Course')
  .attr('children', ['id', 'courseId'], (id, courseId) => {
    Factory.reset('topic');
    return Factory.buildList('topic', 2, null, {
      topicPrefix: `${id}`,
      enabledInContext: false,
      topicNamePrefix: `${id}`,
      usageKey: `${courseId.replace('course-v1:', 'block-v1:')} +type@vertical+block@`,
      discussionCount: 1,
      questionCount: 1,
    });
  });
