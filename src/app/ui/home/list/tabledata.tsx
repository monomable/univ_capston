"use client";
   
import React, { useEffect, useState } from "react";
import axios from 'axios' // https 비동기 통신 라이브러리
import Link from "next/link";
import WebTag from "./webtag";

interface table {
    id : number
    _id : number
    board_id : string
    title : string
    link : string
    category : string
    price : string
    image_base64 : string
    source_website : string
}
 
export default function Users() {
    const [userData, setUSerData] = useState<table[]>([]);
    
    useEffect(() => {
        fetchData();
    }, [])
  
    const fetchData = async () => {
        try {
            const result = await axios(process.env.NEXT_PUBLIC_BASE_URL+"/api/list");
            console.log(result.data);
            setUSerData(result.data);
        } catch (err) {
            console.log("somthing Wrong");
        }
    }
 
    
    const handleDelete=async(id: number)=>{
        console.log(id);
        await axios.delete(process.env.NEXT_PUBLIC_BASE_URL+"/deletepost/"+id);
        const newUserData=userData.filter((item)=>{
            return(
                item._id !==id
            )
        })
        setUSerData(newUserData);
    }
  return (
        <table className="table table-zebra">
        <thead className="text-sm text-gray-700 bg-gray-100">
            <tr>
            <th className="py-3 text-xs md:px-0 md:text-sm">이미지</th>
            <th className="py-3 text-xs md:px-64 md:text-sm">제목</th>
            {/* <th className="py-3 px-6">내용</th> */}
            {/* <th className="py-3 px-6 text-center">액션</th> */}
            </tr>
        </thead>
        <tbody>
            {userData.map((rs, index) => (
            <tr key={rs.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className="md:py-3 md:px-6">
                    <a className="block aspect-square w-full relative" href={`${rs.link}`} rel="noopener noreferrer" target="_blank">
                        <img className="inset-0 w-full h-full object-cover rounded-lg cursor-pointer"
                            src={`data:image/jpeg;base64,${rs.image_base64}`}
                            alt={`핫딜 이미지 ${index + 1}`}/>
                    </a>
                </td>
                <td className="py-3 px-6">
                    {rs.id}
                    <a className="block" href={`${rs.link}`} rel="noopener noreferrer" target="_blank">
                        {WebTag(rs.source_website)}
                        {rs.title} <br/>
                        <div className="text-red-700">{rs.price}</div>
                    </a>
                </td>
                
                {/* <td className="py-3 px-6">{rs.content}</td> 
                <td className="flex justify-center gap-1 py-3">
                    <Link href={`/post/view/${rs.board_id}`} className="btn btn-info">
                    조회
                    </Link>
                    <Link href={`/post/edit/${rs.board_id}`} className="btn btn-primary">
                    수정
                    </Link>
                    <button onClick={()=>handleDelete(rs._id)} className="btn btn-secondary">삭제</button>
                </td>*/}
            </tr>
            ))}
        </tbody>
        </table>
  );
}