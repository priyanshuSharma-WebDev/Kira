import React, { useState, useEffect } from 'react'
import { fetchUserProjects } from '../../http'
import { useSelector, useDispatch } from "react-redux"
import ProjectModal from './Modals/ProjectModal';
import { FiCopy, FiMoreHorizontal, FiTrash } from "react-icons/fi"
import { setProjects } from '../../store/project.slice';
import ProjectPlaceholder from './ProjectPlaceholder';

function Dashboard() {

  const { user: { id } } = useSelector(state => state.user);
  const dispatch = useDispatch()
  const { projects } = useSelector(state => state.projects);
  const [fetchingProjectFlag, setFetchingProjectFlag] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { data: projectsData } } = await fetchUserProjects(id)
      dispatch(setProjects(projectsData))
    })()
  }, [fetchingProjectFlag])


  return (
    <div className='h-[calc(100vh-4rem)] mt-16 w-full'>
      <div className='dashboard-right-header flex h-28 px-36 items-center justify-between border-b-2px border-solid border-b-white/5'>
        <h1 className='dashboard-right-header-title text-white text-2xl relative'>Projects</h1>
        {
          projects.length === 0 ? "" : (
            < label htmlFor="create-project" className="pushable normal-case bg-green-600 rounded-full">
              <span className="front rounded-full w-36 bg-green-400 py-3 flex items-center justify-center">
                Create
              </span>
            </label >
          )
        }
      </div>
      <div className='dashboard-right-body text-white mt-12'>
        {
          projects.length === 0 ? <ProjectPlaceholder /> : (

            <table className="table w-4/5 mx-auto ">
              <thead>
                <tr>
                  <th className='bg-black cursor-pointer text-center'>No.</th>
                  <th className='bg-black cursor-pointer pl-6'>Title</th>
                  <th className='bg-black cursor-pointer'>Tags</th>
                  <th className='bg-black cursor-pointer'>Lead</th>
                  <th className='bg-black'></th>
                </tr>
              </thead>
              <tbody>
                {

                  projects.map(({ _id, title, tags, projectLead }, index) => {
                    return (
                      <tr key={_id} className="cursor-pointer hover:opacity-80 transition-all">
                        <th className='bg-slate-600/20 project-index opacity-60 text-center text-sm'>{index}</th>
                        <td className='bg-slate-600/20 project-title pl-6'>{title}</td>
                        <td className='bg-slate-600/20'>{
                          tags.map((b, idx) => <span key={idx} className="badge bg-button-main-light text-black mr-1">{b}</span>)
                        }</td>
                        <td className='bg-slate-600/20 text-blue-400 project-lead text-sm'>@{projectLead}</td>
                        <td className='bg-slate-600/20 text-center'>
                          <span className='w-12 h-12 flex items-center justify-center rounded-full hover:bg-slate-400/30 transition-all cursor-pointer'><FiMoreHorizontal className='text-2xl' />
                            {/* <div className="dropdown dropdown-hover ">
                              <label tabIndex="0" className="btn bg-transparent border border-solid border-white/10 rounded-xl hover:bg-transparent hover:border-white/10"></label>
                              <ul tabIndex="0" className="dropdown-content menu p-2 shadow bg-black border-2px border-solid border-white/10 rounded-box w-52 flex">
                                <li><button className='btn'><FiTrash /></button></li>
                                <li><button className='btn'><FiCopy /></button></li>
                              </ul>
                            </div> */}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          )
        }
        <ProjectModal fetchingProjectFlag={fetchingProjectFlag} setFetchingProjectFlag={setFetchingProjectFlag} />
      </div>
    </div>
  )
}

export default Dashboard