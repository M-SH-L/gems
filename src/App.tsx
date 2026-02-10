import { ThemeProvider } from './theme/ThemeContext';
import { SoundProvider } from './sound/SoundContext';
import { Desktop } from './shell/Desktop';

function App() {
  return (
    <ThemeProvider>
      <SoundProvider>
        <Desktop />
      </SoundProvider>
    </ThemeProvider>
  );
}

export default App;
