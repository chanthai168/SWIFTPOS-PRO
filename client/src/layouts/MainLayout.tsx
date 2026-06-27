// Layout.jsx
import { Outlet} from 'react-router-dom';
import { Sidebar } from '../components/navigation/LeftbarNav';
import { useAuth0 } from '@auth0/auth0-react';

export default function MainLayout() {
  const {user} = useAuth0();
  return (
    <div className=' flex  '>
        <nav >
            <Sidebar/>
        </nav>

        <main className='w-full'>
            <div className=' bg-layer2 flex justify-end'>
              <div className=' flex p-2 gap-2'>
                <div>
                  <p className=' text-sm font-semibold text-blue-500'>Manager</p>
                  <p>{user?.name}</p>
                </div>
                <img src={user?.picture} className=' rounded-3xl border-2 border-white shadow' alt="" width="48px"/>
              </div>
            </div>

            <Outlet />
        </main>
    </div>
  );
}
