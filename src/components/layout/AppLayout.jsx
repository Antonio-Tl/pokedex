import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useDesign } from '@/lib/DesignContext';

export default function AppLayout() {
  const { design } = useDesign();

  // The dual-screen design brings its own frame (navigation lives on the device).
  if (design === 'ds') return <Outlet />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Outlet />
    </div>
  );
}
