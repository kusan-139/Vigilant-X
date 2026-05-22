import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from 'react';
import Layout from './components/common/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/MapPage';
import Emergency from './pages/Emergency';
import Shelters from './pages/Shelters';
import Predictions from './pages/Predictions';
import Reports from './pages/Reports';
import useStore from './store';

function App() {
  const { setConnected, addAlert, addDisaster, fetchInitialData } = useStore();

  useEffect(() => {
    // 1. Fetch initial data from FastAPI backend
    fetchInitialData();

    // 2. Connect to real WebSocket
    const ws = new WebSocket('ws://localhost:8001/ws/live');

    ws.onopen = () => {
      setConnected(true);
      console.log('Connected to Vigilant-X Live Feed');
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const store = useStore.getState();
        
        if (msg.event === 'shelter_update') {
          store.updateShelterOccupancy(msg.data.id, msg.data.current_occupancy);
        } else if (msg.event === 'disaster_created') {
          store.addDisaster(msg.data);
        } else if (msg.event === 'rescue_request') {
          store.receiveRescueRequest(msg.data);
        } else if (msg.event === 'rescue_deleted') {
          store.receiveDeletedRescueRequest(msg.data.id);
        } else if (msg.event === 'rescue_all_deleted') {
          store.receiveAllDeletedRescueRequests();
        }
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      console.log('Disconnected from Vigilant-X Live Feed');
    };

    return () => {
      ws.close();
    };
  }, [setConnected, fetchInitialData]);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/shelters" element={<Shelters />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Layout>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="dark"
      />
    </BrowserRouter>
  );
}

export default App;
