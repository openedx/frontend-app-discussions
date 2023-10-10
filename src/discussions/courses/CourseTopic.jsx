import { useState, useEffect } from 'react';
import { Link, matchPath } from 'react-router-dom';
import { fetchAllTopicCourse } from './data/thunks';
import { Icon } from '@edx/paragon';
import { HelpOutline, PostOutline } from '@edx/paragon/icons';
import { Routes } from "../../data/constants";
import CoursesPost from './CoursesPost';

const CourseTopic = ()=>{
    const url = location.pathname
    const [courseTopics , setCourseTopics] = useState([])
    const [ courseId ,setCourseId ] = useState('')

    useEffect(() => {
       
        const parts = url.split('/');
        const courseID = parts[parts.length - 1];
        setCourseId(courseID)
        const fetchData = async ()=>{
           try {
                const data = await fetchAllTopicCourse(courseID)
                setCourseTopics(data)
           } catch (error) {
            console.log(error)
           }
        }
        fetchData()
      }, []);

      const isCourseUrl = Boolean(matchPath(location.pathname, { path: Routes.COURSES.PATH[2] }))
     if (isCourseUrl){
        return <CoursesPost courseID={courseId}/>
     }


    return <div>

        {courseTopics.map(topic =>{
            return <Link key={topic.id} to={`${courseId}/${topic.id}`} className='discussion-topic p-0 text-decoration-none text-primary-500'>
            <div className="d-flex flex-row pt-2.5 pb-2 px-4">
                <div className='d-flex flex-column flex-fill' >
                    <div className='d-flex flex-column justify-content-start mw-100 flex-fill'>
                    <div class="topic-name text-truncate">
                    {topic.name}
                    </div>
                    </div>
                    <div className="d-flex align-items-center mt-2.5" style={{marginBottom:'2px'}}>
                    <div className="d-flex align-items-center mr-3.5">
                        <Icon src={PostOutline} className="icon-size mr-2" />
                        {topic.thread_counts.discussion || 0}
                    </div>
                    <div className="d-flex align-items-center mr-3.5">
                <Icon src={HelpOutline} className="icon-size mr-2" />
                {topic.thread_counts.question || 0}
              </div>
                    </div>
                </div>
            
            </div>
          
            <div class="divider pt-1 bg-light-500 border-top border-light-700"></div>
        </Link>
        })}
    </div>
}

export default CourseTopic