import { useEffect, useState } from "react"
import { Link , useHistory, useParams} from 'react-router-dom';
import { fetchAllCourseEnroll } from "./data/thunks"

import { Routes } from "../../data/constants";


const Courses = ()=>{
    
    const {courseId} = useParams()
    const [courseEnroll, setCourseEnroll] = useState([])
    const history = useHistory();
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

      const handlerClick = (course)=>{
        if(course.course_id == courseId){
          history.push(`/${courseId}/posts`)
        }else {
          window.open(`/${course.course_id}/posts`, '_blank')
        }
      }
    return (<>
        <div className="d-flex flex-column ">
        {courseEnroll.map(course =>{
            return <div onClick={()=>handlerClick(course)} key={course.course_id}  className='discussion-courses p-0 text-decoration-none text-primary-500'>
                <div className="d-flex flex-row pt-2.5 pb-2 px-4">
                {course.display_name}
                </div>
                <div class="divider pt-1 bg-light-500 border-top border-light-700"></div>
            </div>
        })}
        
    </div>

    </>)
}


export default Courses