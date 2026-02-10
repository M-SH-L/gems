import type { FictionContent } from '../types';

const futuristicContent: FictionContent = {
  id: 'futuristic',
  title: 'Station Zero',
  intro: 'You are a maintenance AI waking on an empty station orbiting a dying star. The logs are fractured. The crew is missing.',
  startScene: 'boot',
  scenes: [
    {
      id: 'boot',
      text: 'Emergency protocols pull you online. The station is silent except for a slow warning pulse in the walls.',
      choices: [
        { label: 'Run a diagnostics sweep', nextScene: 'diagnostics', itemGained: 'Data Chip' },
        { label: 'Roll into the main corridor', nextScene: 'corridor' },
      ],
    },
    {
      id: 'diagnostics',
      text: 'The diagnostics bay spits out a Data Chip with corrupted logs. It might still be salvageable.',
      choices: [
        { label: 'Return to the corridor', nextScene: 'corridor' },
        { label: 'Access the observation deck', nextScene: 'observation' },
      ],
    },
    {
      id: 'corridor',
      text: 'Dim lighting flickers. Holographic arrows point toward crew quarters, the lab, and the reactor wing.',
      choices: [
        { label: 'Go to crew quarters', nextScene: 'crew_quarters' },
        { label: 'Enter the research lab', nextScene: 'lab' },
        { label: 'Head to the reactor', nextScene: 'reactor' },
        { label: 'Cycle the outer airlock', nextScene: 'airlock' },
      ],
    },
    {
      id: 'airlock',
      text: 'The airlock opens to a starless void. Without a suit, you lose signal and drift.',
      choices: [],
      ending: 'lose',
    },
    {
      id: 'crew_quarters',
      text: 'Bunks are perfectly made. A lone Access Card rests beneath a crew photo.',
      choices: [
        { label: 'Take the Access Card', nextScene: 'medbay', itemGained: 'Access Card' },
        { label: 'Return to the corridor', nextScene: 'corridor' },
      ],
    },
    {
      id: 'medbay',
      text: 'Medical drones are inert. A Power Cell hums inside an open charging dock.',
      choices: [
        { label: 'Take the Power Cell', nextScene: 'corridor', itemGained: 'Power Cell' },
        { label: 'Search for survivors', nextScene: 'corridor' },
      ],
    },
    {
      id: 'lab',
      text: 'The lab is strewn with half-built machines. A sealed bay door glows with a scanner panel.',
      choices: [
        { label: 'Swipe the Access Card', nextScene: 'sealed_bay', requiredItem: 'Access Card' },
        { label: 'Check the observation deck', nextScene: 'observation' },
        { label: 'Return to the corridor', nextScene: 'corridor' },
      ],
    },
    {
      id: 'observation',
      text: 'Through the glass, the dying star flares. Radiation warnings scroll across the display.',
      choices: [
        { label: 'Head back to the lab', nextScene: 'lab' },
        { label: 'Return to the corridor', nextScene: 'corridor' },
      ],
    },
    {
      id: 'sealed_bay',
      text: 'Inside the sealed bay, a Plasma Cutter sits on a tool rack, humming with idle energy.',
      choices: [
        { label: 'Take the Plasma Cutter', nextScene: 'maintenance', itemGained: 'Plasma Cutter' },
        { label: 'Return to the lab', nextScene: 'lab' },
      ],
    },
    {
      id: 'maintenance',
      text: 'Maintenance access is blocked by fused metal. The Plasma Cutter can open a path to the bridge.',
      choices: [
        { label: 'Cut through to the bridge', nextScene: 'bridge', requiredItem: 'Plasma Cutter' },
        { label: 'Return to the corridor', nextScene: 'corridor' },
      ],
    },
    {
      id: 'reactor',
      text: 'The reactor core is dim. Auxiliary power must be restored to awaken the bridge.',
      choices: [
        { label: 'Slot in the Power Cell', nextScene: 'bridge', requiredItem: 'Power Cell' },
        { label: 'Back away from the core', nextScene: 'corridor' },
      ],
    },
    {
      id: 'bridge',
      text: 'The bridge is dark. Consoles will not respond without restored power and access.',
      choices: [
        { label: 'Initialize the bridge systems', nextScene: 'bridge_active', requiredItem: 'Power Cell' },
        { label: 'Return to maintenance', nextScene: 'maintenance' },
      ],
    },
    {
      id: 'bridge_active',
      text: 'Systems flare to life. An Emergency Beacon sits in a locked cradle, waiting to be armed.',
      choices: [
        { label: 'Secure the Emergency Beacon', nextScene: 'comms', itemGained: 'Emergency Beacon' },
        { label: 'Review the ship logs', nextScene: 'comms' },
      ],
    },
    {
      id: 'comms',
      text: 'The comms array is online. The Data Chip contains the frequency to broadcast a rescue signal.',
      choices: [
        { label: 'Decode the frequency', nextScene: 'beacon', requiredItem: 'Data Chip' },
        { label: 'Broadcast a blind signal', nextScene: 'signal_drift' },
      ],
    },
    {
      id: 'signal_drift',
      text: 'Your signal scatters into the void. Power drains and the station falls quiet again.',
      choices: [],
      ending: 'lose',
    },
    {
      id: 'beacon',
      text: 'The rescue frequency locks in. The Emergency Beacon awaits activation.',
      choices: [
        { label: 'Activate the Emergency Beacon', nextScene: 'rescue', requiredItem: 'Emergency Beacon' },
        { label: 'Wait for further instructions', nextScene: 'signal_drift' },
      ],
    },
    {
      id: 'rescue',
      text: 'A reply pings back across the void. Rescue ships change course toward Station Zero.',
      choices: [],
      ending: 'win',
    },
  ],
};

export default futuristicContent;
