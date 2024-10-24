import Link from "next/link";
import TableData from "@/src/app/ui/home/list/tabledata";
import { Suspense } from "react";
import { Spinner } from "@/src/app/ui/home/list/spinner";
  
export default function Home() {
    return (
    <div className="">
      <div className="flex items-center justify-between gap-1 mb-5">
        <h1 className="text-4xl font-bold">DB 리스트업</h1>
      </div>    
        <div className="overflow-x-auto">
          <div className="mb-2 w-full text-left">
            <Link
              href="/user/create" // 버튼 링크 연결
              className="btn btn-primary">
              Create
            </Link>
          </div>
          <Suspense fallback={<Spinner />}>
            <TableData/>
          </Suspense>
      </div>  
    </div>
  ); 
}