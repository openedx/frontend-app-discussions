import { getConfig, snakeCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';



export async function getAllCourseEnroll (courseId){
    
    const url = `${getConfig().STUDIO_BASE_URL}/api/specialization_course/${courseId}`
    const data = await getAuthenticatedHttpClient().get(url)

    
    return data.data.data
}

export async function getAllCourseTopic (courseId) {
    const url = `${getConfig().LMS_BASE_URL}/api/discussion/v1/course_topics/${courseId}`
    const {data} = await getAuthenticatedHttpClient().get(url)
    return data
}