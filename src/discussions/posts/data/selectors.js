export const selectCourseThreads = topicId => state => state.threads.threads[topicId] || [];

export const courseTopicsStatus = state => state.topics.status;
