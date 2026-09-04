export const triggerHaptic = (duration = 50) => {
  // Check if vibration is supported (mostly Android devices, iOS Safari does not support it for web apps)
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(duration);
    } catch (error) {
      console.warn("Haptic feedback error:", error);
    }
  }
};
