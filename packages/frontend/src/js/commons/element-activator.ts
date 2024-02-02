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
