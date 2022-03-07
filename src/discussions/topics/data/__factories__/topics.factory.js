import { Factory } from 'rosie';

Factory.define('topic')
  .option('topicPrefix', null, '')
  .sequence('id', ['topicPrefix'], (idx, topicPrefix) => `${topicPrefix}topic-${idx}`)
  .sequence('name', ['topicPrefix'], (idx, topicPrefix) => `${topicPrefix}topic ${idx}`)
  .attr('thread_counts', [], {
    discussion: 0,
    question: 0,
  })
  .attr('children', []);

Factory.define('category')
  .attr('id', [], null)
  .sequence('name', (idx) => `category-${idx}`)
  .attr('thread_counts', [], {
    discussion: 0,
    question: 0,
  })
  .attr('children', ['name'], (name) => {
    Factory.reset('topic');
    return Factory.buildList('topic', 4, null, { topicPrefix: `${name}-` });
  });

Factory.define('topic.v2')
  .option('topicPrefix', null, '')
  .option('courseId', null, 'course-v1:edX+DemoX+Demo_Course')
  .sequence('id', ['topicPrefix'], (idx, topicPrefix) => `${topicPrefix}topic-${idx}`)
  .sequence('name', ['topicPrefix'], (idx, topicPrefix) => `${topicPrefix}topic ${idx}`)
  .sequence('usage_key', ['id', 'courseId'], (idx, id, courseId) => `block-v1:${courseId.replace('course-v1:', '')}+type@vertical+block@${id}`)
  .attr('enabled_in_context', null, true)
  .attr('thread_counts', [], {
    discussion: 0,
    question: 0,
  });

Factory.define('topic.withThreads')
  .option('topicPrefix', null, '')
  .option('courseId', null, 'course-v1:edX+DemoX+Demo_Course')
  .sequence('id', ['topicPrefix'], (idx, topicPrefix) => `${topicPrefix}topic-${idx}`)
  .sequence('name', ['topicPrefix'], (idx, topicPrefix) => `${topicPrefix}topic ${idx}`)
  .sequence('usage_key', ['id', 'courseId'], (idx, id, courseId) => `block-v1:${courseId.replace('course-v1:', '')}+type@vertical+block@${id}`)
  .attr('enabled_in_context', null, true)
  .attr('thread_counts', [], {
    discussion: 1,
    question: 0,
  });
