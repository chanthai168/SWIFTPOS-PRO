// Layout.jsx
import { Outlet} from 'react-router-dom';
import { Sidebar } from '../components/navigation/LeftbarNav';

export default function MainLayout() {
  return (
    <div className=' flex'>
        <nav>
            <Sidebar/>
        </nav>

        <main className='w-full'>
            <Outlet />
        </main>
    </div>
  );
}
