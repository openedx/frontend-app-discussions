import { useEffect, useState } from "react"
import { Link , matchPath} from 'react-router-dom';
import { fetchAllCourseEnroll } from "./data/thunks"
import CourseTopic from "./CourseTopic";
import { Routes } from "../../data/constants";


const Courses = ()=>{


    const [courseEnroll, setCourseEnroll] = useState([])
    useEffect(() => {
        const fetchData = async () => {
          try {
            const data = await fetchAllCourseEnroll();
            setCourseEnroll(data);
          } catch (error) {
            console.error(error);
           
          
          }
        };
    
        fetchData();
      }, []);
      const isCourseUrl = Boolean(matchPath(location.pathname, { path: Routes.COURSES.PATH[1] }))
      if (isCourseUrl){
        return <CourseTopic />
      }
    

    return (<>
        <div className="d-flex flex-column">
        {courseEnroll.map(course =>{
            return <Link key={course.course_id} to={`courses/${course.course_id}`} className='discussion-topic p-0 text-decoration-none text-primary-500'>
                <div className="d-flex flex-row pt-2.5 pb-2 px-4">
                {course.display_name}
                </div>
                <div class="divider pt-1 bg-light-500 border-top border-light-700"></div>
            </Link>
        })}
        
    </div>

    </>)
}


export default Courses