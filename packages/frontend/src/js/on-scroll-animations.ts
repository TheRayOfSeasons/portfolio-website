import { visibilityActivator } from './commons/element-activator';

document.addEventListener('DOMContentLoaded', () => {
  const animatedElements = document.querySelectorAll('.animated');
  for (const element of [...animatedElements]) {
    visibilityActivator.observe(element);
  }
});
