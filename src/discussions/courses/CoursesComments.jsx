import { useEffect, useState } from "react"
import { fetchThreadComments } from "./data/thunks";

const CoursesComments = ()=>{
    const [comments, setComment] = useState([])
    useEffect(()=>{
        const parts = location.pathname.split('/');
        const threadId = parts[parts.length - 1];
        const fetchData = async() =>{
            try {
                const data = await fetchThreadComments(threadId)
                setComment(data.results)
            } catch (error) {
                console.log(error)
            }
        }
        fetchData()
    },[location.pathname])
    

    console.log(comments)



    return <div className="p-4 bg-light-400 w-100" style={{minHeight:'80vh'}}>
            <h1>Comments</h1>
    </div>
}

export default CoursesComments