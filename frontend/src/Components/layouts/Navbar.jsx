import React, { useState } from 'react'
import {HiOutlineX, HiOutlineMenu} from 'react-icons/hi'
import SideMenu from './SideMenu'

const Navbar = ({activeMenu}) => {
    const [openSideMenu, setOpenSideMenu] = useState(false)
    
    return (
        <div className='flex gap-5 bg-yellow-800 border-b border-gray-200/50 py-4 px-7 sticky top-0 z-30'>
            <button 
                className='block lg:hidden text-black' 
                onClick={() => setOpenSideMenu(!openSideMenu)}
            >
                {openSideMenu ? (
                    <HiOutlineX className='text-2xl'/>
                ) : (
                    <HiOutlineMenu className='text-2xl'/>
                )}
            </button>
            <h2 className="text-lg font-bold text-black">Easy<span className='text-amber-300'>loan</span></h2>
            
            {/* Mobile SideMenu */}
            {openSideMenu && (
                <div className="fixed top-[61px] left-0 z-40 w-64 h-[calc(100vh-61px)] bg-yellow-800 overflow-y-auto">
                    <SideMenu activeMenu={activeMenu} isMobile={true} />
                </div>
            )}
        </div>
    )
}

export default Navbar