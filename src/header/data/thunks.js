
import { postSetLang , patchPreferences , getLanguage , checkSurveyCourse , searchCourse} from "./api"


export async function fetchPreferences (username,code) {
    return patchPreferences(username,{prefLang : code })
}


export async function fetchDataLanguage (code){
   
    return postSetLang(code)
}

export async function fetchLanguage (username){
    return getLanguage(username)
}

export async function fetchSurveyCourse (courseId){
    return checkSurveyCourse(courseId)
}

export async function fetchSearchCourse (courseIdFromUrl, search_string, pageIndex){

    return searchCourse(courseIdFromUrl, search_string, pageIndex)
}