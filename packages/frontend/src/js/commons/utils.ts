export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Runs a callback function in custom asymmetric intervals.
 * @param callback - The callback function
 * @param durations - An array of durations.
 */
export function setAsymmetricInterval(callback: Function, durations: number[]) {
  let index = -1;
  let counter = 0;

  const getNextDuration = () => {
    if (index < durations.length - 1) {
      index++;
    } else {
      index = 0;
    }
    return durations[index];
  };

  const timedCallback = () => {
    const result = callback(++counter);
    let duration: number;
    switch (typeof (result)) {
      case 'number':
        duration = result;
        break;
      default:
        duration = getNextDuration();
        break;
    }
    setTimeout(() => timedCallback(), duration);
  };
  timedCallback();
}
