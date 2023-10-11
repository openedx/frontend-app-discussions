import { getConfig, snakeCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';



export async function getAllCourseEnroll (){
    const url = `${getConfig().LMS_BASE_URL}/api/resume-url/`
    const data = await getAuthenticatedHttpClient().get(url)
    const resume_button_url = data.data.resume_button_url
    const results = resume_button_url.map(({ url, textContent, ...rest }) => rest)
    return results
}

