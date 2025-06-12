import Header from './header';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className='min-h-screen flex flex-col'>
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;
