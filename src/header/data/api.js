import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { convertKeyNames, snakeCaseObject } from '@edx/frontend-platform/utils';


export async function patchPreferences(username, params) {
  let processedParams = snakeCaseObject(params);

  processedParams = convertKeyNames(processedParams, {
    pref_lang: 'pref-lang',
  });
  
  await getAuthenticatedHttpClient()
    .patch(`${getConfig().LMS_BASE_URL}/api/user/v1/preferences/${username}`, processedParams, {
      headers: { 'Content-Type': 'application/merge-patch+json' },
    });

  return params; // TODO: Once the server returns the updated preferences object, return that.
}

export async function postSetLang(code) {
  const formData = new FormData();
  formData.append('language', code);

  await getAuthenticatedHttpClient()
    .post(`${getConfig().LMS_BASE_URL}/i18n/setlang/`, formData, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    });
}

export async function getLanguage (username) {
  const data=  await getAuthenticatedHttpClient()
    .get(`${getConfig().LMS_BASE_URL}/api/user/v1/preferences/${username}`);

    return data.data
}


export async function checkSurveyCourse(courseId){
  const url = `${getConfig().LMS_BASE_URL}/api/survey-course/${courseId}`

  const data = await getAuthenticatedHttpClient().get(url)

  return data.data
}


export async function searchCourse(courseIdFromUrl, search_string, pageIndex){
  const formData = new FormData();
  formData.append("search_string", search_string );
  formData.append('page_size', 20)
  formData.append('page_index', pageIndex)
  const url = `${getConfig().LMS_BASE_URL}/search/${courseIdFromUrl}`
  const data = await getAuthenticatedHttpClient().post(url , formData , {
    headers: { 'X-Requested-With': 'XMLHttpRequest' }
  })
  console.log(data)
  return {
    data : data.data.results,
    total : data.total
  }
}

