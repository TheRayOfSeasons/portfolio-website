const convertCoordsToTranslation = (x: number, y: number) => `translate(${x}px, ${y}px)`;

export class MouseEffect {
  mousePosition = {
    x: 0,
    y: 0,
  };

  element: HTMLElement;

  constructor(element: HTMLElement) {
    this.element = element;
    this.element.style.transform = convertCoordsToTranslation(window.innerWidth / 2, -10);
    const onMouseMove = (event: MouseEvent) => {
      if (window.innerWidth < 767) {
        return;
      }
      this.mousePosition.x = event.clientX - (this.element.clientWidth * 0.5);
      this.mousePosition.y = event.clientY - (this.element.clientHeight * 0.5);
      let transform = convertCoordsToTranslation(this.mousePosition.x, this.mousePosition.y);

      const { target } = event;
      if (target) {
        const element = (target as HTMLElement).closest('[aria-mouse-follower]');
        if (element) {
          const animationEvent = element.getAttribute('aria-mouse-follower');
          switch (animationEvent) {
            case 'expand':
              transform += ' scale(5.0)';
              break;
            default:
              transform += ' scale(1.0)';
              break;
          }
        }
      } else {
        transform += ' scale(0.2)';
      }
      this.element.style.transform = transform;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('drag', onMouseMove, { passive: true });
  }
}

export function initializeMouseEffect(element: HTMLElement): MouseEffect {
  const effect = new MouseEffect(element);
  return effect;
}
