import { Observer } from './observer';

/**
 * Encapsulates logic for activating elements through CSS classes.
 */
export class ElementActivator {
  element: Element;
  flag = 'active';

  constructor(element: Element) {
    this.element = element;
  }

  setActive(toggle: boolean) {
    if (toggle) {
      this.element.classList.add(this.flag);
    } else {
      this.element.classList.remove(this.flag);
    }
  }

  open() {
    this.setActive(true);
  }

  close() {
    this.setActive(false);
  }
}

export const visibilityActivator = new Observer({
  root: null,
  rootMargin: '24px',
  threshold: [0, 0.2],
});
visibilityActivator.subscribe((entry) => {
  if (entry.intersectionRatio > 0.2) {
    entry.target.classList.add('active');
  } else if (entry.intersectionRatio <= 0) {
    entry.target.classList.remove('active');
  }
});
