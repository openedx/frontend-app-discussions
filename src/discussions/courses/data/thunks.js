
import { getAllCourseEnroll, getAllCourseTopic} from "./api";


export async function fetchAllCourseEnroll (courseId){
    return getAllCourseEnroll(courseId)
}


export async function fetchAllCourseTopics (courseId) {
    return getAllCourseTopic(courseId)
}