import { describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import CircuitGame from '@/games/circuit/CircuitGame';

const GRID_SIZE = 5;
const BOARD_PX = 500;

function mockRect(node: SVGSVGElement) {
  Object.defineProperty(node, 'getBoundingClientRect', {
    value: () => ({
      width: BOARD_PX,
      height: BOARD_PX,
      top: 0,
      left: 0,
      right: BOARD_PX,
      bottom: BOARD_PX,
      x: 0,
      y: 0,
      toJSON: () => '',
    }),
  });
}

function cellCenter(row: number, col: number) {
  const cellSize = BOARD_PX / GRID_SIZE;
  return {
    x: col * cellSize + cellSize / 2,
    y: row * cellSize + cellSize / 2,
  };
}

function drawPath(svg: SVGSVGElement, cells: Array<[number, number]>) {
  const [startRow, startCol] = cells[0];
  const start = cellCenter(startRow, startCol);

  fireEvent.mouseDown(svg, {
    clientX: start.x,
    clientY: start.y,
    button: 0,
  });

  for (const [row, col] of cells.slice(1)) {
    const point = cellCenter(row, col);
    fireEvent.mouseMove(svg, {
      clientX: point.x,
      clientY: point.y,
    });
  }

  fireEvent.mouseUp(svg);
}

describe('CircuitGame', () => {
  it('renders grid, nodes, and timer', () => {
    renderWithProviders(<CircuitGame />);

    const grid = screen.getByTestId('circuit-grid');
    expect(grid).toBeInTheDocument();
    expect(screen.getByTestId('node-red-source')).toBeInTheDocument();
    expect(screen.getByTestId('node-red-target')).toBeInTheDocument();
    expect(screen.getByTestId('node-blue-source')).toBeInTheDocument();
    expect(screen.getByTestId('node-blue-target')).toBeInTheDocument();
    expect(screen.getByTestId('circuit-timer')).toBeInTheDocument();
  });

  it('shows completion message when all paths are connected', async () => {
    renderWithProviders(<CircuitGame />);

    const grid = screen.getByTestId('circuit-grid') as SVGSVGElement;
    mockRect(grid);

    drawPath(grid, [
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
    ]);

    drawPath(grid, [
      [4, 0],
      [4, 1],
      [4, 2],
      [4, 3],
      [4, 4],
    ]);

    expect(await screen.findByRole('status')).toHaveTextContent('Level complete');
  });
});
