import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CustomCursor from './CustomCursor';
import Footer from './components/Footer';
import Home from './components/Home';
import CapabilityWorks from './components/CapabilityWorks';
import { GalleryCacheProvider } from './context/GalleryCacheContext';
import './index.css';

function App() {
  return (
    <GalleryCacheProvider>
      <Router>
        <CustomCursor />
        <div className="void-bg"></div>

        <div className="main-app">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/works/:capability" element={<CapabilityWorks />} />
          </Routes>
        </div>

        <Footer />
      </Router>
    </GalleryCacheProvider>
  );
}

export default App;
