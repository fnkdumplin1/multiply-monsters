// A tiny shared "sprite sheet" of 8x8 pixel-grid icons, so every arcade mode
// card draws from one consistent 8-bit icon language instead of mismatched
// emoji. Each bitmap is 8 rows of 8 chars; '#' is a filled pixel.
import React from 'react';

export function PixelIcon({ bitmap, className }) {
  const size = bitmap.length;
  const rects = [];
  bitmap.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] === '#') {
        rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />);
      }
    }
  });
  return (
    <svg
      className={className}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <g fill="currentColor">{rects}</g>
    </svg>
  );
}

export const PIXEL_ICONS = {
  // Training - friendly starter monster
  monster: [
    '..#....#',
    '..#....#',
    '.######.',
    '########',
    '##.##.##',
    '########',
    '.##..##.',
    '.#....#.',
  ],
  // Training - tentacled floater, second battle-arena monster variant
  monsterTentacle: [
    '..####..',
    '.######.',
    '########',
    '##.##.##',
    '########',
    '########',
    '#.#.#.#.',
    '.#.#.#.#',
  ],
  // Training - horned imp, third battle-arena monster variant
  monsterHorned: [
    '#......#',
    '.#....#.',
    '..####..',
    '.######.',
    '########',
    '##.##.##',
    '.######.',
    '..#..#..',
  ],
  // Training - big-eyed blob, fourth battle-arena monster variant
  monsterBigEye: [
    '..####..',
    '.######.',
    '##....##',
    '#.####.#',
    '#.####.#',
    '##....##',
    '.######.',
    '..#..#..',
  ],
  // Detective - magnifying glass
  magnifier: [
    '.####...',
    '#....#..',
    '#....#..',
    '#....#..',
    '.####...',
    '...##...',
    '....##..',
    '.....##.',
  ],
  // Two-Digit - multiplication mark
  multiply: [
    '#......#',
    '##....##',
    '.##..##.',
    '..####..',
    '..####..',
    '.##..##.',
    '##....##',
    '#......#',
  ],
  // Division - obelus
  divide: [
    '...##...',
    '...##...',
    '........',
    '########',
    '########',
    '........',
    '...##...',
    '...##...',
  ],
  // Monster race - stopwatch
  stopwatch: [
    '..####..',
    '.#....#.',
    '#......#',
    '#...#..#',
    '#...##.#',
    '#......#',
    '.#....#.',
    '..####..',
  ],
  // Boss battle - skull
  skull: [
    '.######.',
    '########',
    '##.##.##',
    '########',
    '########',
    '.######.',
    '..#..#..',
    '.#.##.#.',
  ],
  // Battle mode - shield
  shield: [
    '.######.',
    '########',
    '##....##',
    '##.##.##',
    '##.##.##',
    '.##..##.',
    '..####..',
    '...##...',
  ],
  // Squad Showdown - crossed swords
  swords: [
    '#......#',
    '##....##',
    '.##..##.',
    '#######.',
    '..####..',
    '.##..##.',
    '##....##',
    '#......#',
  ],
  // Training mode - ray gun blaster, facing right
  raygun: [
    '........',
    '....###.',
    '..######',
    '.#######',
    '.######.',
    '..##....',
    '..##....',
    '.####...',
  ],
  // Battle Mode ancillary screens - create/add action
  plus: [
    '........',
    '...##...',
    '...##...',
    '.######.',
    '.######.',
    '...##...',
    '...##...',
    '........',
  ],
  // Battle Mode ancillary screens - back/leave/cancel action
  arrowLeft: [
    '........',
    '....#...',
    '...##...',
    '..###...',
    '#######.',
    '..###...',
    '...##...',
    '....#...',
  ],
  // Battle Mode ancillary screens - loading/in-progress state
  refresh: [
    '..####..',
    '.#....#.',
    '#......#',
    '#.......',
    '.......#',
    '#......#',
    '.#....#.',
    '..####..',
  ],
  // Battle Mode ancillary screens - view results action
  chart: [
    '........',
    '#.......',
    '#..#....',
    '#..#..#.',
    '#..#..#.',
    '#..#..#.',
    '#.......',
    '########',
  ],
  // Battle Mode ancillary screens - back to menu action
  home: [
    '...##...',
    '..####..',
    '.######.',
    '########',
    '.#....#.',
    '.#.##.#.',
    '.#.##.#.',
    '.######.',
  ],
  // Battle Mode ancillary screens - end/stop action
  stop: [
    '........',
    '.######.',
    '.######.',
    '.######.',
    '.######.',
    '.######.',
    '.######.',
    '........',
  ],
  // Battle Mode ancillary screens - confirm-dialog question icon
  question: [
    '.####...',
    '#....#..',
    '.....#..',
    '....##..',
    '...##...',
    '........',
    '...##...',
    '........',
  ],
  // Battle Mode ancillary screens - confirm-dialog "Yes" icon
  check: [
    '........',
    '......#.',
    '.....##.',
    '....##..',
    '#..##...',
    '.##.....',
    '.#......',
    '........',
  ],
  // Battle monitor - time remaining
  clock: [
    '..####..',
    '.#....#.',
    '#..#...#',
    '#..##..#',
    '#......#',
    '.#....#.',
    '..####..',
    '........',
  ],
  // Battle monitor - battle complete
  flag: [
    '##......',
    '######..',
    '##.###..',
    '######..',
    '##......',
    '##......',
    '##......',
    '##......',
  ],
  // Battle monitor - top-three leaderboard rank
  trophy: [
    '.######.',
    '.######.',
    '..####..',
    '...##...',
    '..####..',
    '.######.',
    '.######.',
    '........',
  ],
  // Squad Showdown lobby - "not ready yet" status
  hourglass: [
    '.######.',
    '..####..',
    '...##...',
    '..####..',
    '.#....#.',
    '#......#',
    '#......#',
    '.######.',
  ],
  // Battle results - champion rank
  crown: [
    '#.#.#.#.',
    '#.#.#.#.',
    '########',
    '.######.',
    '.######.',
    '.######.',
    '.######.',
    '........',
  ],
};
