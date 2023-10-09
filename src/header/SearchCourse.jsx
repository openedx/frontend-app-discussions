import { Dropdown , Modal, Button , ModalLayer , useToggle, ModalCloseButton } from '@edx/paragon';
import { useEffect, useState } from 'react';
import { fetchSearchCourse } from './data/thunks';
import { useParams , useHistory } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform';
import { useSelector } from 'react-redux';


const SearchCourse = ()=>{
    const {courseId} = useSelector(state=>state.courseTabs)
    const [isOpen, open, close] = useToggle(false);
    const [resultSearch, setResultSearch] = useState([])
    const [pageIndex, setPageIndex] = useState(0)
    const [inputValue , setInputValue] = useState('')

    const handlerSearch = async()=>{
        try {
            
            const page_index = 0
           const {data , total} = await fetchSearchCourse(courseId, inputValue, page_index)
           setResultSearch(data)
           console.log(resultSearch)
        } catch (error) {
           console.log(error) 
        }
    }
    const handlerLoadMore = async()=>{
        try {

            const newPageIndex = pageIndex + 1;
            setPageIndex(prevPageIndex => prevPageIndex + 1 )
            const {data, total} = await fetchSearchCourse(courseIdFromUrl, inputValue, newPageIndex);
            setResultSearch(prevResult => [...prevResult, ...data]);
            setPageIndex(newPageIndex);
            console.log(resultSearch)
        } catch (error) {
            console.log(error)
        }
    }

      useEffect(()=>{
        if(isOpen){
            setResultSearch([])
            setPageIndex(0)
        }    
    },[isOpen])
   

    const handlerNavigate = (e)=>{
        window.location.href = `${getConfig().LMS_BASE_URL}${e.data.url}`
    }

    const handleKeyPress = (e)=>{
        if(e.key === 'Enter'){
            handlerSearch()
        }
    }

    return (
    <div className='search-course-custom'>
      <div className="d-flex">
        <button className='btn-search'  onClick={open}>
            <i class="bi bi-search"></i>
        </button>
      </div>
      <ModalLayer isOpen={isOpen} onClose={close}>
        <div role="dialog" aria-label="My dialog" className="modal-search mw-sm p-4 bg-white mx-auto my-5 rounded ">
            <div className='modal-header-search d-flex justify-content-between align-items-center' >
                <span className='search-title'>Search</span>
                <span onClick={close} className='search-close rounded'><i class="bi bi-x-lg"></i></span>
            </div>
            <div className='modal-body-search'>
                <div className='input-search rounded'>
                    <input type='text' className='' name='search'
                     onChange={(e)=>setInputValue(e.target.value)}
                     onKeyDown={handleKeyPress}
                     />
                    <i class="bi bi-search" onClick={handlerSearch}></i>
                </div>
            </div>
            <span className='search-title' style={{fontSize:'1.2rem'}}>Results :</span>
            <div className='search-results'>
             {resultSearch.length > 0 ?  resultSearch.map(e =>{
                           return ( <div className='p-2' onClick={()=>handlerNavigate(e)} >
                           <div className='result-item rounded border p-4'>
                                   <div className='d-flex justify-content-between'>
                                       <span className='search-title' style={{fontSize:'1.3rem', fontWeight:'bold'}} >
                                        {e.data.location[1]}
                                         </span>
                                       <div>
                                            <span className='search-lesson   px-3'>Lesson</span>
                                        </div>
                                   </div>
                                   <div className='excerpt' dangerouslySetInnerHTML={{ __html: e.data.excerpt }} />
                                          
                                          
                           </div>
                       </div>)
                    }) : <span>Not Found</span>}
                    {resultSearch.length > 0 &&  <div className='text-center'>
                    <button className='btn-load-more' onClick={handlerLoadMore}>Load More</button>
                </div>  }
                
            </div>
        </div>
      </ModalLayer>

    </div>
    )
}

export default SearchCourse