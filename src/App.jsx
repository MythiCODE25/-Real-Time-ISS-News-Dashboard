import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { ISSProvider } from './context/ISSContext';
import { NewsProvider } from './context/NewsContext';
import { ChatProvider } from './context/ChatContext';
import DashboardLayout from './layouts/DashboardLayout';
import Overview from './pages/Overview';
import ISSTracker from './pages/ISSTracker';
import NewsDashboard from './pages/NewsDashboard';
import Analytics from './pages/Analytics';
import ChatbotPage from './pages/ChatbotPage';

export default function App() {
  return (
    <ThemeProvider>
      <ISSProvider>
        <NewsProvider>
          <ChatProvider>
            <BrowserRouter>
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: 'rgba(4,17,40,0.95)',
                    color: '#f1f5f9',
                    border: '1px solid rgba(99,102,241,0.3)',
                    borderRadius: '12px',
                    fontSize: '13px',
                    backdropFilter: 'blur(20px)',
                  },
                }}
              />
              <Routes>
                <Route element={<DashboardLayout />}>
                  <Route path="/" element={<Overview />} />
                  <Route path="/iss" element={<ISSTracker />} />
                  <Route path="/news" element={<NewsDashboard />} />
                  <Route path="/charts" element={<Analytics />} />
                  <Route path="/chatbot" element={<ChatbotPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ChatProvider>
        </NewsProvider>
      </ISSProvider>
    </ThemeProvider>
  );
}
