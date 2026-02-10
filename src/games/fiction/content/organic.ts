import type { FictionContent } from '../types';

const organicContent: FictionContent = {
  id: 'organic',
  title: 'Whispers of the Grove',
  intro: 'You are a seedling spirit called to heal the Great Tree. The forest listens to every step you take.',
  startScene: 'seedling',
  scenes: [
    {
      id: 'seedling',
      text: 'Dawn filters through the canopy. The Great Tree\'s pulse is faint, and the grove waits for your touch.',
      choices: [
        { label: 'Follow the mushroom path', nextScene: 'mushroom_path' },
        { label: 'Walk toward the river delta', nextScene: 'river_path' },
      ],
    },
    {
      id: 'mushroom_path',
      text: 'Mushroom caps glow in the shade. A firefly circles your head, begging to be caught.',
      choices: [
        { label: 'Catch the firefly', nextScene: 'glimmer_cave', itemGained: 'Firefly Lantern' },
        { label: 'Return to the glade', nextScene: 'seedling' },
      ],
    },
    {
      id: 'glimmer_cave',
      text: 'The cave sparkles with spores. Healing Pollen drifts like golden dust.',
      choices: [
        { label: 'Gather Healing Pollen', nextScene: 'forest_floor', itemGained: 'Healing Pollen' },
        { label: 'Follow the roots downward', nextScene: 'ancient_hollow', requiredItem: 'Firefly Lantern' },
      ],
    },
    {
      id: 'river_path',
      text: 'The river delta hums with life. A smooth River Stone rests in the shallows.',
      choices: [
        { label: 'Take the River Stone', nextScene: 'ferry', itemGained: 'River Stone' },
        { label: 'Follow the riverbank', nextScene: 'forest_floor' },
      ],
    },
    {
      id: 'ferry',
      text: 'A slick log bridges the current. The water churns with restless spirits.',
      choices: [
        { label: 'Calm the river with the Stone', nextScene: 'forest_floor', requiredItem: 'River Stone' },
        { label: 'Step onto the slippery log', nextScene: 'bog_sink' },
      ],
    },
    {
      id: 'forest_floor',
      text: 'The forest floor is soft with moss. Paths lead to the canopy village and a thorny thicket.',
      choices: [
        { label: 'Climb to the canopy village', nextScene: 'canopy_village' },
        { label: 'Push into the thorn thicket', nextScene: 'thorn_thicket' },
        { label: 'Seek the root gate', nextScene: 'root_gate' },
      ],
    },
    {
      id: 'canopy_village',
      text: 'Forest folk offer guidance in exchange for a story. They gift a Blossom Charm to brave climbers.',
      choices: [
        { label: 'Accept the Blossom Charm', nextScene: 'sky_bridge', itemGained: 'Blossom Charm' },
        { label: 'Descend to the forest floor', nextScene: 'forest_floor' },
      ],
    },
    {
      id: 'sky_bridge',
      text: 'A vine bridge sways above the canopy. The wind threatens to tear it apart.',
      choices: [
        { label: 'Cross with the Blossom Charm', nextScene: 'root_gate', requiredItem: 'Blossom Charm' },
        { label: 'Climb back down', nextScene: 'forest_floor' },
      ],
    },
    {
      id: 'thorn_thicket',
      text: 'Thorns snag your cloak. Faint light reveals a hidden hollow beyond the briars.',
      choices: [
        { label: 'Use the Firefly Lantern to navigate', nextScene: 'ancient_hollow', requiredItem: 'Firefly Lantern' },
        { label: 'Force through the thorns', nextScene: 'bog_sink' },
      ],
    },
    {
      id: 'ancient_hollow',
      text: 'Roots form a chamber around a stone pedestal. A Root Key rests in the center.',
      choices: [
        { label: 'Claim the Root Key', nextScene: 'root_gate', itemGained: 'Root Key' },
        { label: 'Return to the forest floor', nextScene: 'forest_floor' },
      ],
    },
    {
      id: 'root_gate',
      text: 'The Root Gate pulses with saplight. The Great Tree\'s heartbeat is close.',
      choices: [
        { label: 'Unlock the gate with the Root Key', nextScene: 'heart_chamber', requiredItem: 'Root Key' },
        { label: 'Listen for the tree\'s whisper', nextScene: 'spirit_echo' },
      ],
    },
    {
      id: 'spirit_echo',
      text: 'A whisper warns that the heart needs water and light. The grove trembles in anticipation.',
      choices: [
        { label: 'Return to the forest floor', nextScene: 'forest_floor' },
        { label: 'Step toward the heart', nextScene: 'heart_chamber', requiredItem: 'Root Key' },
      ],
    },
    {
      id: 'heart_chamber',
      text: 'The Great Tree\'s heart glows faintly. A spring waits for a steadying touch.',
      choices: [
        { label: 'Place the River Stone in the spring', nextScene: 'heart_second', requiredItem: 'River Stone' },
        { label: 'Dust the roots with Healing Pollen', nextScene: 'heart_second', requiredItem: 'Healing Pollen' },
      ],
    },
    {
      id: 'heart_second',
      text: 'The chamber brightens, but the roots still ache. One more offering is needed.',
      choices: [
        { label: 'Dust the roots with Healing Pollen', nextScene: 'great_tree', requiredItem: 'Healing Pollen' },
        { label: 'Place the River Stone in the spring', nextScene: 'great_tree', requiredItem: 'River Stone' },
      ],
    },
    {
      id: 'great_tree',
      text: 'The Great Tree surges with life. The grove erupts in song as the corruption fades.',
      choices: [],
      ending: 'win',
    },
    {
      id: 'bog_sink',
      text: 'The ground gives way to a silent bog. You sink beneath the surface and the grove falls quiet.',
      choices: [],
      ending: 'lose',
    },
  ],
};

export default organicContent;
