import type { FictionContent } from '../types';

const retroContent: FictionContent = {
  id: 'retro',
  title: 'Dungeon of the Pixel King',
  intro: 'A glitching dungeon hums beneath the castle. Find the lost crown before the pixels decay.',
  startScene: 'entry',
  scenes: [
    {
      id: 'entry',
      text: 'You stand before a pixelated gate. The stone flickers like a broken sprite, and a faint 8-bit melody leaks from below.',
      choices: [
        { label: 'Step into the flickering hallway', nextScene: 'hallway' },
        { label: 'Inspect the cracked gate', nextScene: 'gate', itemGained: 'Rusty Key' },
      ],
    },
    {
      id: 'gate',
      text: 'Behind a loose brick you find a Rusty Key. The lock hums as if it recognizes the metal.',
      choices: [
        { label: 'Unlock the gate and enter', nextScene: 'hallway' },
        { label: 'Pocket the key and check the torch room', nextScene: 'torch_room' },
      ],
    },
    {
      id: 'hallway',
      text: 'A long corridor stretches into darkness. The floor tiles blink on and off, revealing warnings that scroll too fast to read.',
      choices: [
        { label: 'Light an unlit torch', nextScene: 'torch_room', itemGained: 'Torch' },
        { label: 'Follow the dripping sound', nextScene: 'slime_pit' },
        { label: 'Open the side door', nextScene: 'armory', requiredItem: 'Rusty Key' },
      ],
    },
    {
      id: 'torch_room',
      text: 'Rows of torches line the wall. A small flame dances in your palm, eager to be carried forward.',
      choices: [
        { label: 'Return to the hallway', nextScene: 'hallway' },
        { label: 'Descend the pixel stairs', nextScene: 'trap_bridge' },
      ],
    },
    {
      id: 'slime_pit',
      text: 'Green slime bubbles below. A narrow bridge flickers in and out of existence.',
      choices: [
        { label: 'Jump the pit', nextScene: 'trap_bridge' },
        { label: 'Search the slime', nextScene: 'potion_nook', itemGained: 'Health Potion' },
      ],
    },
    {
      id: 'potion_nook',
      text: 'A hidden alcove holds a Health Potion. It glows like a single red pixel in the dark.',
      choices: [
        { label: 'Climb out and cross the bridge', nextScene: 'trap_bridge' },
        { label: 'Head back to the hallway', nextScene: 'hallway' },
      ],
    },
    {
      id: 'armory',
      text: 'The armory door creaks open. A Pixel Sword floats above a pedestal, humming with low-resolution power.',
      choices: [
        { label: 'Claim the Pixel Sword', nextScene: 'armory_after', itemGained: 'Pixel Sword' },
        { label: 'Leave the armory quietly', nextScene: 'hallway' },
      ],
    },
    {
      id: 'armory_after',
      text: 'With the Pixel Sword in hand, the air crackles. A hidden stairway lights up in neon blocks.',
      choices: [
        { label: 'Follow the hidden stairway', nextScene: 'riddle_npc' },
        { label: 'Head toward the bridge', nextScene: 'trap_bridge' },
      ],
    },
    {
      id: 'trap_bridge',
      text: 'A bridge of glitching tiles spans a chasm. Each step echoes like a beep.',
      choices: [
        { label: 'Cross carefully', nextScene: 'riddle_npc' },
        { label: 'Drop to the secret crawl', nextScene: 'secret_crawl' },
      ],
    },
    {
      id: 'secret_crawl',
      text: 'A tight crawlspace swallows the light. You hear the hum of corrupted code all around you.',
      choices: [
        { label: 'Use the Torch to navigate', nextScene: 'glitch_lab', requiredItem: 'Torch' },
        { label: 'Feel your way blindly', nextScene: 'dead_end_fall' },
      ],
    },
    {
      id: 'glitch_lab',
      text: 'Screens flicker with broken sprites. A Magic Scroll is trapped inside a looping animation.',
      choices: [
        { label: 'Free the Magic Scroll', nextScene: 'library', itemGained: 'Magic Scroll' },
        { label: 'Return to the bridge', nextScene: 'trap_bridge' },
      ],
    },
    {
      id: 'library',
      text: 'An 8-bit librarian hovers near shelves of scrolling text. The air smells like warm circuitry.',
      choices: [
        { label: 'Consult the riddle guardian', nextScene: 'riddle_npc' },
        { label: 'Backtrack toward the bridge', nextScene: 'trap_bridge' },
      ],
    },
    {
      id: 'riddle_npc',
      text: 'A guardian sprite blocks the way. It asks, "I wear a crown yet I am not a king. What am I?"',
      choices: [
        { label: 'Answer: The dungeon itself', nextScene: 'crown_vault' },
        { label: 'Offer the Magic Scroll', nextScene: 'crown_vault', requiredItem: 'Magic Scroll' },
        { label: 'Challenge the guardian with the Pixel Sword', nextScene: 'sword_duel', requiredItem: 'Pixel Sword' },
      ],
    },
    {
      id: 'sword_duel',
      text: 'The guardian yields after a short duel. It drops a glowing clue and points you toward the vault.',
      choices: [
        { label: 'Follow the guardian to the vault', nextScene: 'crown_vault' },
        { label: 'Return to the bridge', nextScene: 'trap_bridge' },
      ],
    },
    {
      id: 'crown_vault',
      text: 'A massive door guards the Pixel King\'s crown. The lock is old but stubborn.',
      choices: [
        { label: 'Use the Rusty Key', nextScene: 'throne_room', requiredItem: 'Rusty Key' },
        { label: 'Force the door open', nextScene: 'dead_end_fall' },
      ],
    },
    {
      id: 'throne_room',
      text: 'The throne room glows as the crown rises from its pedestal. The dungeon stabilizes around you.',
      choices: [],
      ending: 'win',
    },
    {
      id: 'dead_end_fall',
      text: 'The floor drops away into static. Your vision dissolves into a reset screen.',
      choices: [],
      ending: 'lose',
    },
  ],
};

export default retroContent;
