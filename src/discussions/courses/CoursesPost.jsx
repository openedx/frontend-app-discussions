import { useEffect, useState } from "react"
import { PostsView } from "../posts"
import { fetchTreadsCourse } from "./data/thunks"
import { useHistory, useParams, Link } from 'react-router-dom';
import PostsList from "../posts/PostsList";
import { PostAvatar } from "../posts/post/PostHeader";




const CoursesPost = ({courseID})=>{
    
    const {courseId} = useParams()
    const history = useHistory();
    const [allPost , setAllPost] = useState([])
    useEffect(()=>{
        const fetchData = async ()=>{
            try {
                const data = await fetchTreadsCourse(courseID)
                setAllPost(data.results)
            } catch (error) {
                history.push(`/${courseId}/topic`)      
              
            }
        }
        fetchData()
    },[courseID])

    


    return (
    <div className="list-group list-group-flush flex-fill">
        {allPost.map(post =>{
           
              const read = post.read || (!post.read && post.commentCount !== post.unreadCommentCount);
            return <Link to={`${post.topic_id}/post/${post.id}`} className='discussion-post p-0 text-decoration-none text-gray-900' style={{lineHeight:'22px'}}>
                    <div className="d-flex flex-row pt-2.5 pb-2 px-4 border-primary-500 position-relative bg-light-300">
                        <div className="mr-3 pt-2 ml-0.5">
                            <PostAvatar post={post} authorLabel={post.authorLabel} fromPostLink read={read} />
                        </div>
                        <div className="d-flex flex-column flex-fill">
                            <div className="d-flex flex-column justify-content-start mw-100 flex-fill">
                                <div className="d-flex align-items-center pb-0 mb-0 flex-fill font-weight-500">
                                    <div className="mr-1.5">
                                        <span className="font-weight-500 font-size-14 text-primary-500 font-style-normal font-family-inter align-bottom">{post.title}</span>
                                        <span class="align-bottom"> </span>
                                        <span class="text-gray-700 font-weight-normal font-size-14 font-style-normal font-family-inter align-bottom">{post.preview_body}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex align-items-center">
                            <span class="mr-1 font-size-14 font-style-normal font-family-inter font-weight-500 text-primary-500" role="heading" aria-level="2">{post.author}</span>
                            </div>
                        </div>
                    </div>
                </Link>
        })}
    </div>
    )
}

export default CoursesPost