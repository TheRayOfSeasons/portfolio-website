/**
 * This manages all intersection callbacks into one observer.
 */
type ObserverCallback = {(entry: IntersectionObserverEntry): void};

/**
 * A wrapper class for an IntersectionObserver
 * that handles all intersection callbacks.
 */
class Observer {
  observer: IntersectionObserver;

  options: IntersectionObserverInit = {
    root: null,
    rootMargin: '0px',
    threshold: [0, 1],
  };

  hooks: ObserverCallback[] = [];

  constructor() {
    this.observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        for (const hook of this.hooks) {
          hook(entry);
        }
      }
    }, this.options);
  }

  observe(element: Element) {
    this.observer.observe(element);
  }

  unobserve(element: Element) {
    this.observer.unobserve(element);
  }

  subscribe(subscriber: ObserverCallback): number {
    const index = this.hooks.push(subscriber) - 1;
    return index;
  }

  /**
   * Unsubscribes a function from the observer based on its index.
   */
  unsubscribe(index: number): ObserverCallback[] {
    return this.hooks.splice(index, 1);
  }
}

export const observer = new Observer();
