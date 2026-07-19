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

        <main className='w-full '>
            <Outlet />
        </main>
    </div>
  );
}
