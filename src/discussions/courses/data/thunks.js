
import { getAllCourseEnroll} from "./api";


export async function fetchAllCourseEnroll (courseId){
    return getAllCourseEnroll(courseId)
}

