export function create(element, attributes) {
  const el = document.createElement(element);
  for (const key in attributes) {
    el.setAttribute(key, attributes[key]);
  }
  return el;
}

export function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}


