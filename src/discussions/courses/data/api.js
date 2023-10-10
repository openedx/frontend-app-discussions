import { getConfig, snakeCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';



export async function getAllCourseEnroll (){
    const url = `${getConfig().LMS_BASE_URL}/api/resume-url/`
    const data = await getAuthenticatedHttpClient().get(url)
    const resume_button_url = data.data.resume_button_url
    const results = resume_button_url.map(({ url, textContent, ...rest }) => rest)
    return results
}

export async function getAllTopicCourse (courseId){
    const url =  `${getConfig().LMS_BASE_URL}/api/discussion/v1/course_topics/${courseId}`
    const data = await getAuthenticatedHttpClient().get(url)
    const results= data.data.non_courseware_topics
    
    return results
}

export const getThreadsApiUrl = () => `${getConfig().LMS_BASE_URL}/api/discussion/v1/threads/`;
export const getCommentsApiUrl = () => `${getConfig().LMS_BASE_URL}/api/discussion/v1/comments/`;

export async function getThreads(
    courseId
  ) {
    const params = snakeCaseObject({
      courseId,
    });
    const { data } = await getAuthenticatedHttpClient().get(getThreadsApiUrl(), { params });

    return data;
  }



export async function getThreadComments(
    threadId
  ) {
    const params = snakeCaseObject({
      threadId});
  
    const { data } = await getAuthenticatedHttpClient()
      .get(getCommentsApiUrl(), { params });
    console.log(data)
    return data;
  }
  