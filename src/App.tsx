import { ThemeProvider } from './theme/ThemeContext';
import { Desktop } from './desktop/Desktop';

function App() {
  return (
    <ThemeProvider>
      <Desktop />
    </ThemeProvider>
  );
}

export default App;
