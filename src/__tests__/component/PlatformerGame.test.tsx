import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import PlatformerGame from '@/games/platformer/PlatformerGame';

class MockCanvasContext2D {
  canvas = { width: 300, height: 150 };
  fillStyle = '';
  strokeStyle = '';
  shadowBlur = 0;
  shadowColor = '';
  imageSmoothingEnabled = true;
  clearRect() {}
  fillRect() {}
  strokeRect() {}
  beginPath() {}
  arc() {}
  fill() {}
  moveTo() {}
  lineTo() {}
  closePath() {}
  save() {}
  restore() {}
  translate() {}
  rotate() {}
  quadraticCurveTo() {}
}

const getContextMock = () => new MockCanvasContext2D();

describe('PlatformerGame', () => {
  it('renders canvas and HUD', () => {
    HTMLCanvasElement.prototype.getContext = () => getContextMock() as any;
    renderWithProviders(<PlatformerGame />);

    expect(screen.getByTestId('platformer-canvas')).toBeInTheDocument();
    expect(screen.getByTestId('platformer-hud')).toBeInTheDocument();
    expect(screen.getByTestId('platformer-score')).toHaveTextContent('Score');
    expect(screen.getByTestId('platformer-lives')).toHaveTextContent('Lives');
    expect(screen.getByTestId('platformer-level')).toHaveTextContent('Level');
  });
});
