import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { LessonIntro } from './pages/LessonIntro';
import { Memorize } from './pages/Memorize';
import { Test } from './pages/Test';
import { Vault } from './pages/Vault';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="vault" element={<Vault />} />
          <Route path="lesson/:id/intro" element={<LessonIntro />} />
          <Route path="lesson/:id/memorize" element={<Memorize />} />
          <Route path="lesson/:id/test" element={<Test />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
