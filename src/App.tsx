import { ThemeProvider } from './theme/ThemeContext';
import { Desktop } from './shell/Desktop';

function App() {
  return (
    <ThemeProvider>
      <Desktop />
    </ThemeProvider>
  );
}

export default App;
