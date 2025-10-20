import { useQuery } from '@tanstack/react-query'
import { axiosInstance } from '../lib/axios';
import Sidebar from '../components/Sidebar';

function HomePage() {

  const {data:authUser}=useQuery({queryKey: ["authUser"]});

  const {data:recommendedUsers}=useQuery({
    queryKey: ["recommendedUsers"],
    queryFn: async () => {
        const res = await axiosInstance.get("/users/suggestions");
        return res.data;
    }
  });

  const {data:posts}=useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
        const res = await axiosInstance.get("/posts");
        return res.data;
    }
  });

  console.log("Recommended Users: ", recommendedUsers);
  console.log("Posts: ", posts);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className='hidden lg:block lg:col-span-1'>
          <Sidebar user={authUser}/>
        </div>
    </div>
  )
}

export default HomePage