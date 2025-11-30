export const playSound = (type: 'hover' | 'click' | 'success' | 'deploy') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    // Create context only when needed to adhere to browser autoplay policies
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'hover') {
      // High-pitch short blip
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'click') {
      // Mechanical switch sound
      osc.type = 'square';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'success') {
      // Power-up chord arpeggio
      const playNote = (freq: number, timeOffset: number) => {
        const oscN = ctx.createOscillator();
        const gainN = ctx.createGain();
        oscN.connect(gainN);
        gainN.connect(ctx.destination);
        oscN.type = 'triangle';
        oscN.frequency.value = freq;
        gainN.gain.setValueAtTime(0.05, now + timeOffset);
        gainN.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.4);
        oscN.start(now + timeOffset);
        oscN.stop(now + timeOffset + 0.4);
      };
      playNote(440, 0);   // A4
      playNote(554, 0.1); // C#5
      playNote(659, 0.2); // E5
      playNote(880, 0.3); // A5
    } else if (type === 'deploy') {
        // Heavy bass drop
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 1.5);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 1.5);
        osc.start(now);
        osc.stop(now + 1.5);
    }
  } catch (e) {
    // Fail silently if audio context is blocked
  }
};