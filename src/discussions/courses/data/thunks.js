
import { getAllCourseEnroll, getAllTopicCourse, getThreads , getThreadComments} from "./api";


export async function fetchAllCourseEnroll (){
    return getAllCourseEnroll()
}

export async function fetchAllTopicCourse (courseId){
    return getAllTopicCourse(courseId)
}

export async function fetchTreadsCourse (courseId) {
    return getThreads(courseId)
}

export async function fetchThreadComments  (threadId){
    return getThreadComments(threadId)
}